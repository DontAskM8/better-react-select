import { Component } from "react";
import ReactSelect from "react-select";
import { Table, Column, List, AutoSizer } from "react-virtualized";
import { css } from 'glamor'
import 'react-virtualized/styles.css';

function normalizeCssName(str = "") {
	let i = [...str.match(/[A-Z]/g) ?? []].forEach(function(x){
	    str = str.replace(x, "-" + x.toLowerCase())
	})
	return str
}

function normalizeCss(cssObj) {
	return processCssObject(cssObj)
}

function processCssObject(obj = {}){
	var _cssObj = {}
	Object.keys(obj).forEach(function(x){
		let processedName = normalizeCssName(x)
		if(typeof obj[x] == "object"){
			obj[x] = processCssObject(obj[x])
		}
		_cssObj[processedName] = obj[x]
	})
	return _cssObj
}

export default class Select extends Component {
	constructor() {
		super()
		this.MenuListRenderer = this.MenuListRenderer.bind(this)
		this.MenuRenderer = this.MenuRenderer.bind(this)
		this.rowRenderer = this.rowRenderer.bind(this)
		this.state = {
			extendedGroups: [],
			search: ""
		}
	}

	componentDidMount() {
		var self = this
		self.setState({
			list: self.props.options
		})
	}

	rowRenderer({ key, index, isScrolling, isVisible, style,...bruh }, styles = {}, props) {
		var self = this
		var list = self.props.options
		var currentSelected = props.getValue()
		var filter = props.selectProps.inputValue.toLowerCase()
		if(self.props.grouped){
			currentSelected = currentSelected.map(x => x.value)
			if(filter != ""){
				list = list.map(x => ({
					...x,
					originalValue: x.value,
					value: x.value.filter(x => x.label.toLowerCase().includes(filter))
				}))

				list = list.filter(x => {
					return x.value.length != 0 || x.label.toLowerCase().includes(filter)
				}).map(x => {
					if(x.value.length == 0 && x.label.toLowerCase().includes(filter)){
						return { ...x, value: x.originalValue}
					}
					return x
				})

			}

			list = list
			.filter(x => x.value.map(y => y.value)
			.filter(z => !currentSelected.includes(z)).length != 0)
			.map(x => [{
				label: x.label,
				value: x.label,
				count: x.value.map(y => y.value).filter(z => !currentSelected.includes(z)).length,
				groupLabel: x.value
			}].concat(self.state.extendedGroups.includes(x.label) ? x.value : []))

			if(list.length != 0){
				list = list.reduce((a,b) => a.concat(b))
			}

			list = list.filter(x => !currentSelected.includes(x.value))
		}

		if(list[index]?.groupLabel){
			Object.assign(styles, {
				backgroundColor: "pink"
			})
		}

		var _style = css({
			...normalizeCss(styles),
			...normalizeCss(style),
			cursor: "pointer"
		})

		return (
			<div key={key} style={style} {..._style} onClick={ () => {
				if(list[index].groupLabel){
					self.setState(function(prevState){
						if(prevState.extendedGroups.includes(list[index].label)){
							var newGroups = prevState.extendedGroups.filter(x => x != list[index].label)
						}else{
							var newGroups = prevState.extendedGroups.concat(list[index].label)
						}
						return {
							extendedGroups: newGroups
						}
					})
				}else{
					if(props.isMulti){
						let currentValue = props.getValue()
						props.setValue(currentValue.concat(list[index]))
					}else{
						props.setValue(list[index])
					}
				}
			} }>
				{
					(() => {
						if(list[index]?.groupLabel){
							return (
								<>
									<span onClick={ () => {
										var currentSelected = props.getValue()
										var allValues = list[index].groupLabel.filter(x => x.value)
										var haventSelected = allValues.filter(x => !currentSelected.includes(x.value))
										props.setValue(currentSelected.concat(haventSelected))
									} }>( + ) </span>
									<span>{list[index].label}</span>
									<span style={{
										right: "0",
    								position: "absolute"
									}}> ({list[index].count} ) { self.state.extendedGroups.includes(list[index].label) ? "  " : ".... " } </span>
								</>
							)
						}
						return list[index]?.label
					})()
				}
	    </div>
		)
	}

	MenuRenderer(props) {
		var self = this
		const { children, className, cx, getStyles, innerRef, innerProps } = props;
		return (
			<div
			 style={getStyles('menu', props)}
			 className={cx({ menu: true }, className)}
			 ref={props.innerRef}
			 {...innerProps}
			>
				{ (() => self.MenuListRenderer(props))() }
			</div>
		);
	}

	MenuListRenderer(props) {
		var self = this

		var currentSelected = props.getValue()
		var filter = props.selectProps.inputValue.toLowerCase()
		currentSelected = currentSelected.map(x => x.value)

		let options = self.props.options
		var rowCount = props.options.length
		if(self.props.grouped){
			if(filter != ""){
				options = options.map(x => ({
					...x,
					originalValue: x.value,
					value: x.value.filter(x => x.label.toLowerCase().includes(filter))
				}))
				.filter(x => x.value.length != 0 || x.label.toLowerCase().includes(filter)).map(x => {
					if(x.value.length == 0 && x.label.toLowerCase().includes(filter)){
						return { ...x, value: x.originalValue}
					}
					return x
				})
			}

			options = options
			.filter(x => x.value.map(y => y.value)
			.filter(z => !currentSelected.includes(z)).length != 0)
			.map(x => [{
				label: x.label,
				value: x.label,
				count: x.value.map(y => y.value).filter(z => !currentSelected.includes(z)).length,
				groupLabel: x.value
			}].concat(self.state.extendedGroups.includes(x.label) ? x.value : []))

			if(options.length != 0){
				options = options.reduce((a,b) => a.concat(b))
			}
			rowCount = options.length
		}

		if(rowCount == 0){
			return props.selectProps.noOptionsMessage()
		}

    return (
			<div className="myClassListName" ref={props.innerRef}>
				<AutoSizer>
				{ () => {
					return <List
						width={350}
						height={ 25*rowCount > 350 ? 350 : 25*rowCount }
						rowCount={ rowCount }
						rowRenderer={ (p) => self.rowRenderer(p, props.getStyles("option", props), props)}
						rowHeight={25}
						overscanRowCount={3}
						style={ props.getStyles("menuList", props) }
						className={props.cx(
			        {
			          'menu-list': true,
			          'menu-list--is-multi': props.isMulti,
			        }
			      )} >
					</List>
				} }
				</AutoSizer>
			</div>
    );
	}

	MenuListRendererBlank() {
		return <div></div>
	}

	render() {
		var self = this
		return <ReactSelect escapeClearsValue={false} {...self.props} filterOption={ ({label, data, value}, search) => {
			return true
		} }
		 components={{
			 Menu: self.MenuRenderer,
			 MenuList: self.MenuListRendererBlank
		}}></ReactSelect>
	}
}
