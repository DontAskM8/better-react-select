import { Component } from "react";
import ReactSelect, { components } from "react-select";
import { List, AutoSizer } from "react-virtualized";
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
		if(typeof obj[x] === "object"){
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
		this.DropdownIndicator = this.DropdownIndicator.bind(this)
		this.Control = this.Control.bind(this)
		this.rowRenderer = this.rowRenderer.bind(this)
		this.state = {
			extendedGroups: [],
			search: "",
			selectedValues: [],
			openMenu: false
		}
	}

	// componentDidMount() {
	// 	var self = this
	// 	self.setState({
	// 		list: self.props.options
	// 	})
	// }

	MenuRenderer(props) {
		var self = this
		const { className, cx, getStyles, innerProps } = props;
		console.log("Rendering menu")
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
		console.log("Rendering menulist")

		var currentSelected = props.getValue()
		var _currentSelected = currentSelected
		var filter = props.selectProps.inputValue.toLowerCase()
		currentSelected = currentSelected.map(x => x.value)

		let options = self.props.options
		var rowCount = props.options.length
		if(self.props.grouped){
			if(filter !== ""){
				options = options.map(x => ({
					...x,
					originalValue: x.value,
					value: x.value.filter(x => x.label.toLowerCase().includes(filter))
				}))
				.filter(x => x.value.length !== 0 || x.label.toLowerCase().includes(filter)).map(x => {
					if(x.value.length === 0 && x.label.toLowerCase().includes(filter)){
						return { ...x, value: x.originalValue}
					}
					return x
				})
			}

			options = options
			.filter(x => x.value.map(y => y.value)
			.filter(z => !currentSelected.includes(z)).length !== 0)
			.map(x => [{
				label: x.label,
				value: x.value.map(y => y.value),
				count: x.value.map(y => y.value).filter(z => !currentSelected.includes(z)).length,
				groupLabel: x.value
			}].concat(self.state.extendedGroups.includes(x.label) ? x.value : []))

			if(options.length !== 0){
				options = options.reduce((a,b) => a.concat(b))
			}

			options = options.filter(x => !currentSelected.includes(x.value))

			rowCount = options.length
		}
		else {
			options = options.filter(x => {
				return !currentSelected.includes(x.value) && x.label.toLowerCase().includes(filter)
			})
			rowCount = options.length
		}

		if(rowCount === 0){
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
						rowRenderer={ (p) => {
							return self.rowRenderer(p, props.getStyles("option", props), options, props, _currentSelected)
						} }
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

	rowRenderer(p, styles, options, props, currentSelectedProp) {
		var self = this
		var data = options[p.index]

		if(options[p.index]?.groupLabel){
			Object.assign(styles, {
				backgroundColor: "pink"
			})
		}

		var _style = css({
			...normalizeCss(styles),
			...normalizeCss(p.style),
			cursor: "pointer"
		})

		return (
			<div key={ p.key } style={ p.style } {..._style} onClick={ () => {
				if(options[p.index].groupLabel){
					self.setState(function(prevState){
						if(prevState.extendedGroups.includes(options[p.index].label)){
							var newGroups = prevState.extendedGroups.filter(x => x !== options[p.index].label)
						}else{
							var newGroups = prevState.extendedGroups.concat(options[p.index].label)
						}
						return {
							extendedGroups: newGroups
						}
					})
				}else{
					if(props.isMulti){
						let currentValue = currentSelectedProp//props.getValue()
						props.setValue(currentValue.concat(options[p.index]))
					}else{
						props.setValue(options[p.index])
					}
				}
			} }>
				{
					(() => {
						if(options[p.index]?.groupLabel){
							return (
								<>
									<span onClick={ () => {
										var currentSelected = currentSelectedProp//props.getValue()
										var allValues = options[p.index].groupLabel.filter(x => x.value)
										var haventSelected = allValues.filter(x => !currentSelected.includes(x.value))
										props.setValue(currentSelected.concat(haventSelected))
									} }>( + ) </span>
									<span>{options[p.index].label}</span>
									<span style={{
										right: "0",
    								position: "absolute"
									}}> ({options[p.index].count} ) { self.state.extendedGroups.includes(options[p.index].label) ? "  " : ".... " } </span>
								</>
							)
						}
						return options[p.index]?.label
					})()
				}
	    </div>
		)
	}

	MenuListRendererBlank() {
		return <div></div>
	}

	Control(props) {
		var self = this
		props.innerProps.onClick = () => {
			self.setState({ openMenu: !self.state.openMenu })
		}
		var selectedCount = props.getValue()
		return <components.Control {...props}>{props.children}
		<div style={{ color: "darkgrey" }} >{ selectedCount.length } items</div>
		</components.Control>
	}

	ValueContainer() {
		return <div></div>
	}

	DropdownIndicator(props){
		var self = this
		// props.innerProps.onMouseDown = () => {
		// 	self.setState({ openMenu: !self.state.openMenu })
		// }
		return <components.DropdownIndicator {...props} ></components.DropdownIndicator>
	}

	render() {
		var self = this
		return <ReactSelect escapeClearsValue={false} menuIsOpen={self.state.openMenu} {...self.props} filterOption={ ({label, data, value}, search) => {
			return true
		} }
		 components={{
			 Control: self.Control,
			 Menu: self.MenuRenderer,
			 MenuList: self.MenuListRendererBlank,
			 // DropdownIndicator: self.DropdownIndicator
			 // ValueContainer: self.ValueContainer
		}}></ReactSelect>
	}
}
