import React, { createRef } from "react";
import ReactDOM from "react-dom";
import "./ContextMenuHandler.scss";

import ChevronIcon from "../Icons/Chevron.svg";
import ErrorBoundary from "./ErrorBoundary";

function exclude(object, ...exclusions) {
	const output = Object.assign({}, object);

	for (const exclusion of exclusions) delete output[exclusion];
	return output;
}

class ContextMenu extends React.Component {
	ref = createRef();

	docClickEv = e => {
		if (this.ref.current && !this.ref.current.contains(e.target) && !document.getElementsByClassName("ContextMenu")[0].contains(e.target)) {
			this.close();
		}
	}

	close() {
		if (ContextMenu.activeWrapper) {
			ContextMenu.activeWrapper.setState({ menu: null, open: false });
		}
	}

	componentDidMount() {
		document.addEventListener("click", this.docClickEv);
	}

	componentWillUnmount() {
		document.removeEventListener("click", this.docClickEv);
	}

	render() {
		return (
			<ErrorBoundary>
				<div className="ContextMenu" {...this.props} ref={this.ref}>
					{ this.props.children }
				</div>
			</ErrorBoundary>
		);
	}
}

ContextMenu.Handler = class extends React.Component {
	static ref = createRef();
	
	render() {
		return (
			<ErrorBoundary>
				<div ref={ContextMenu.Handler.ref} className="ContextMenuWrapper MainContextMenuContainer">
					
				</div>
			</ErrorBoundary>
		);
	}
};

ContextMenu.Wrapper = class extends React.Component {
	state = { menu: null, open: false };
	ref = createRef();
	
	get publicProps() {
		return exclude(this.props, "menu", "openOnClick", "wrapperClassName", "overrideX", "overrideY");
	}

	handleContextMenu = e => {
		if (typeof(e.preventDefault) === "function")
			e.preventDefault();

		if (ContextMenu.activeWrapper) {
			if (this.ref.current.contains(ContextMenu.activeWrapper.ref.current) && ContextMenu.activeWrapper.props.menu !== this.props.menu)
				return;
			ContextMenu.activeWrapper.setState({ menu: null, open: false });
		}

		ContextMenu.activeWrapper = this;
		
		let top = this.props.menu.props.overrideY?.() || e.clientY;
		let left = this.props.menu.props.overrideX?.() || e.clientX;
		
		while (left + 200 > window.innerWidth)
			left -= 10;
		
		this.setState({ menu: ReactDOM.createPortal(
				<div className="ContextMenuContainer SecondaryBg" {...this.publicProps} style={{
					position: "fixed",
					top, left 
				}}>{ this.props.menu }</div>, ContextMenu.Handler.ref.current), open: true });
	}

	async componentDidUpdate(prevProps, prevState, snapshot) {
		if (ContextMenu.activeWrapper === this && !this.state.open)
			ContextMenu.activeWrapper = null;
		
		if (this.state.open && this.ref.current) {
			const [ menu ] = document.getElementsByClassName("ContextMenuContainer");
			const rect = menu.getBoundingClientRect();
			
			menu.style.transform = rect.y + rect.height > window.innerHeight
				? `translateY(${window.innerHeight - (rect.y + rect.height) - 20}px)`
				: null;
		}
	}

	render() {
		return this.props.menu ? (
			<ErrorBoundary>
				<div ref={this.ref} className={"ContextMenuWrapper " + (this.props.wrapperClassName || "")} onClick={this.props.openOnClick ? e => {
					if (typeof(e.target.onClick) === "function")
						return;
					
					this.handleContextMenu(this.props.openOnClick());
				} : null}
					 {...this.publicProps} onContextMenu={this.handleContextMenu}>
					{ this.props.children }
					
					<ErrorBoundary>
						{ this.state.open ? this.state.menu : null }
					</ErrorBoundary>
				</div>
			</ErrorBoundary>
		) : this.props.children;
	}
}

ContextMenu.Item = class extends React.Component {
	handleClick = e => {
		e.preventDefault();
		e.stopPropagation();
		
		if (ContextMenu.activeWrapper && this.props.autoClose) {
			ContextMenu.activeWrapper.setState({ menu: null, open: false });
		}

		if (this.props.onClick) {
			this.props.onClick(this);
		}
	};

	render() {
		const props = Object.assign({}, this.props);

		delete props.autoClose;
		delete props.icon;

		return (
			<div className="ContextMenuItem" {...props} onClick={this.handleClick}>
				{ this.props.icon }
				
				{ this.props.children }
			</div>
		);
	}
}

ContextMenu.SubMenuItem = class extends React.Component {
	state = { open: false };

	handleMouseEnter = () => {
		this.setState({ open: true });
	}

	handleMouseLeave = () => {
		this.setState({ open: false });
	}

	handleClick = e => {
		if (e.target !== e.currentTarget) {
			return;
		}

		if (ContextMenu.activeWrapper && this.props.autoClose) {
			ContextMenu.activeWrapper.setState({ menu: null, open: false });
		}

		if (this.props.onClick) {
			this.props.onClick(this);
		}
	}
	
	mount(menu) {
		if (!menu) return;
		const rect = menu.getBoundingClientRect();

		menu.style.transform = rect.y + rect.height > window.innerHeight
			? `translateY(${window.innerHeight - (rect.y + rect.height) - 20}px)`
			: null;
		
		if (rect.x + rect.width > window.innerWidth) {
			menu.style.left = "unset";
			menu.style.right = "100%";
		}
	}

	render() {
		const props = Object.assign({}, this.props);

		delete props.autoClose;
		delete props.label;
		delete props.icon;

		return (
			<div className="ContextMenuItem HasSubMenu" {...props} onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				{ this.props.icon }
				{ this.props.label } <img className="ContextSubMenuChevron" src={ChevronIcon}/>
				{ this.state.open ? (
					<div className="ContextMenuContainer SubMenuContainer SecondaryBg" ref={this.mount}>
						<div className="ContextMenu SubMenu">
							{ this.props.children }
						</div>
					</div>
				) : null }
			</div>
		)
	}
}

ContextMenu.ToggleItem = class extends React.Component {
	state = { checked: false };

	callback = () => {
		if (ContextMenu.activeWrapper && this.props.autoClose) {
			ContextMenu.activeWrapper.setState({ menu: null, open: false });
		}

		const checked = !this.state.checked;

		if (this.props.callback) {
			this.props.callback(checked);
		}

		this.setState({ checked });
	}

	componentDidMount() {
		this.setState({ checked: this.props.checked });
	}

	render() {
		const props = Object.assign({}, this.props);

		delete props.autoClose;
		delete props.callback;

		return (
			<div className="ContextMenuItem ToggleItem" {...props} onClick={this.callback}>
				<div className={"ToggleBox" + (this.state.checked ? " Checked" : "")}>
					{ this.state.checked ? (<div className="ToggleBoxTick"/>) : null }
				</div>
				{ this.props.children }
			</div>
		)
	}
}

ContextMenu.Divider = class extends React.Component {
	render() {
		return (
			<div className="ContextMenuDivider" {...this.props}/>
		)
	}
}

export default ContextMenu;