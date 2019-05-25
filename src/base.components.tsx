import React, { Component } from 'react';
import { kebapCase,classifyItems } from './utils';

export class ComponentWrapper extends Component{
    render() {
      return this.props.children;
        return <div className={kebapCase(this.constructor.name)}>{this.props.children}</div>;
    }
}
export class MultislotTransclusionComponent extends Component{
    static classes=[];
    nodeDecorator(node,klass){
      console.log(node);
      //node.className=kebapCase(klass.name)
      return node;
    }
    render() {
        const classification = classifyItems(
          this.props.children,
          this['constructor']['classes']
        )
        return <div className={ kebapCase(this['constructor']['classes']) }>
            {this['constructor']['classes'].map( 
                klass => this.nodeDecorator(<div className={kebapCase(klass.name)}>{classification[klass.name]||[]}</div>,klass)
            )}
        </div>
    }
}
