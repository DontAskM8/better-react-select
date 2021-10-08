import { Component } from "react";
import ReactSelect from "react-select";
import { Table, Column, List, AutoSizer } from "react-virtualized";
import { css } from "glamor";
import "react-virtualized/styles.css";

function normalizeCssName(str = "") {
  let i = [...(str.match(/[A-Z]/g) ?? [])].forEach(function (x) {
    str = str.replace(x, "-" + x.toLowerCase());
  });
  return str;
}

function normalizeCss(cssObj) {
  return processCssObject(cssObj);
}

function processCssObject(obj = {}) {
  var _cssObj = {};
  Object.keys(obj).forEach(function (x) {
    let processedName = normalizeCssName(x);
    if (typeof obj[x] == "object") {
      obj[x] = processCssObject(obj[x]);
    }
    _cssObj[processedName] = obj[x];
  });
  return _cssObj;
}

export default class Select extends Component {
  constructor() {
    super();
    this.MenuListRenderer = this.MenuListRenderer.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.state = {
      extendedGroups: [],
      search: "",
    };
  }

  rowRenderer(
    { key, index, isScrolling, isVisible, style, ...bruh },
    styles = {},
    props
  ) {
    var self = this;
    var list = self.props.options;
    var currentSelected = props.getValue();
    var filter = props.selectProps.inputValue.toLowerCase();
    if (self.props.grouped) {
      currentSelected = currentSelected.map((x) => x.value);
      if (filter != "") {
        list = list.map((x) => ({
          ...x,
          originalValue: x.value,
          value: x.value.filter((x) => x.label.toLowerCase().includes(filter)),
        }));

        list = list
          .filter((x) => {
            return (
              x.value.length != 0 || x.label.toLowerCase().includes(filter)
            );
          })
          .map((x) => {
            if (x.value.length == 0 && x.label.toLowerCase().includes(filter)) {
              return { ...x, value: x.originalValue };
            }
            return x;
          });
      }

      list = list
        .filter(
          (x) =>
            x.value
              .map((y) => y.value)
              .filter((z) => !currentSelected.includes(z)).length != 0
        )
        .map((x) =>
          [
            {
              label: x.label,
              value: x.label,
              count: x.value
                .map((y) => y.value)
                .filter((z) => !currentSelected.includes(z)).length,
              groupLabel: x.value,
            },
          ].concat(self.state.extendedGroups.includes(x.label) ? x.value : [])
        );

      if (list.length != 0) {
        list = list.reduce((a, b) => a.concat(b));
      }

      list = list.filter((x) => !currentSelected.includes(x.value));
    }

    if (list[index]?.groupLabel) {
      Object.assign(styles, {
        backgroundColor: "pink",
      });
    }

    var _style = css({
      ...normalizeCss(styles),
      ...normalizeCss(style),
      cursor: "pointer",
    });

    return (
      <div
        key={key}
        style={style}
        {..._style}
        onClick={() => {
          if (list[index].groupLabel) {
            self.setState(function (prevState) {
              if (prevState.extendedGroups.includes(list[index].label)) {
                var newGroups = prevState.extendedGroups.filter(
                  (x) => x != list[index].label
                );
              } else {
                var newGroups = prevState.extendedGroups.concat(
                  list[index].label
                );
              }
              return {
                extendedGroups: newGroups,
              };
            });
          } else {
            if (props.isMulti) {
              let currentValue = props.getValue();
              props.setValue(currentValue.concat(list[index]));
            } else {
              props.setValue(list[index]);
            }
          }
        }}
      >
        {(() => {
          if (list[index]?.groupLabel) {
            return (
              <>
                <span
                  onClick={() => {
                    var currentSelected = props.getValue();
                    var allValues = list[index].groupLabel.filter(
                      (x) => x.value
                    );
                    var haventSelected = allValues.filter(
                      (x) => !currentSelected.includes(x.value)
                    );
                    props.setValue(currentSelected.concat(haventSelected));
                  }}
                >
                  ( + ){" "}
                </span>
                <span>{list[index].label}</span>
                <span
                  style={{
                    right: "0",
                    position: "absolute",
                  }}
                >
                  {" "}
                  ({list[index].count} ){" "}
                  {self.state.extendedGroups.includes(list[index].label)
                    ? "  "
                    : ".... "}{" "}
                </span>
              </>
            );
          }
          return list[index]?.label;
        })()}
      </div>
    );
  }

  MenuListRenderer(props) {
    var self = this;
    var children = props.children;

    if (!children.length) {
      return <div className="myClassListName">{children}</div>;
    }

    var currentSelected = props.getValue();
    var filter = props.selectProps.inputValue.toLowerCase();
    currentSelected = currentSelected.map((x) => x.value);

    let options = self.props.options;
    var rowCount = props.options.length;
    if (self.props.grouped) {
      if (filter != "") {
        options = options
          .map((x) => ({
            ...x,
            originalValue: x.value,
            value: x.value.filter((x) =>
              x.label.toLowerCase().includes(filter)
            ),
          }))
          .filter(
            (x) => x.value.length != 0 || x.label.toLowerCase().includes(filter)
          )
          .map((x) => {
            if (x.value.length == 0 && x.label.toLowerCase().includes(filter)) {
              return { ...x, value: x.originalValue };
            }
            return x;
          });
      }

      options = options
        .filter(
          (x) =>
            x.value
              .map((y) => y.value)
              .filter((z) => !currentSelected.includes(z)).length != 0
        )
        .map((x) =>
          [
            {
              label: x.label,
              value: x.label,
              count: x.value
                .map((y) => y.value)
                .filter((z) => !currentSelected.includes(z)).length,
              groupLabel: x.value,
            },
          ].concat(self.state.extendedGroups.includes(x.label) ? x.value : [])
        );

      if (options.length != 0) {
        options = options.reduce((a, b) => a.concat(b));
      }
      rowCount = options.length;
    }

    return (
      <div className="myClassListName" ref={props.innerRef}>
        <AutoSizer disableHeight={true} disableWidth={true}>
          {() => {
            return (
              <List
                width={350}
                height={300}
                rowCount={rowCount}
                rowRenderer={(p) =>
                  self.rowRenderer(p, props.getStyles("option", props), props)
                }
                rowHeight={25}
                style={props.getStyles("menu", props)}
              ></List>
            );
          }}
        </AutoSizer>
      </div>
    );
  }

  render() {
    var self = this;
    return (
      <ReactSelect
        {...self.props}
        filterOption={({ label, data, value }, search) => {
          return true;
        }}
        components={{
          MenuList: self.MenuListRenderer,
        }}
      ></ReactSelect>
    );
  }
}
