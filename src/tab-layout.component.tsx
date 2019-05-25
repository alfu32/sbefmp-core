import React, { Component } from 'react';
import { hydrate } from 'react-dom';
import { ComponentWrapper,MultislotTransclusionComponent } from './base.components';
import { id,guid,kebapCase,classifyItems,TaggedChildrenClassifier } from './utils';
import { EventEmitter } from './event';
import { debounceTime } from 'rxjs/operators';
import './tab-layout.style.scss';

export class TabTitle extends ComponentWrapper{}
export class Tab extends Component implements TaggedChildrenClassifier{
  id=guid(3,5);
  state={}
  selected(evt){
    console.log(this);
      this.props['selected'](this.id);
  }
  getContentView(){
      const classification = this.classify();
      return classification['default'];
  }
  classify(){
    return classifyItems(this.props.children,[TabTitle])
  }
  render(){
    const classification = this.classify();
    return <div className="tab-title" onClick={this.selected.bind(this)}>{classification['TabTitle']}</div>
  }
}

export class Tabs extends Component implements TaggedChildrenClassifier{
  @EventEmitter( debounceTime(1000) ) event;
  _subscriptions=[];
  state={
    currentId:guid(3,3),
    currentTabIndex:0,
    currentTab:null
  }
  id=id();
  classification = this.classify();
  constructor(props){
    super(props);

  }
  
  componentDidMount(){
    this._subscriptions.push(
      this.event.subscribe(this.props['on-TabChange']),
    );
  }
  componentWillUnmount(){
    this._subscriptions.forEach( s => s.unsubscribe() );
    this._subscriptions = [];
  }
  classify() {
    return classifyItems(this.props.children, [Tab] )['Tab']
      .reduce( (a,tab) => {
        const cls = classifyItems(tab.props.children, [TabTitle] );
        a['titles'].push(cls['TabTitle']);
        a['content'].push(cls['default']);
        return a;
      },{titles:[],content:[]});
  }
  createClickTabHandler(n){
    return ( (evt)=>{
      this.setState({ ...this.state, currentTabIndex:n });
      this.event.notify({emitter:this,state:n});
    }).bind(this);
  }

  start(){}
  moving(){}
  end(){}
  render(){

    return <div className="tabs-layout" >
      <div className="tabs-titles">
        {this.classification['titles'].map( (x,i) => <div className='tab-title' tab-selected={(this.state.currentTabIndex === i).toString()} onClick={this.createClickTabHandler(i)}
        onMouseDown={this.start}
        onTouchStart={this.start}
        onPointerDown={this.start}
        onMouseMove={this.moving}
        onMouseUp={this.end}>{(this.state.currentTabIndex == i)} {x}</div> ) }
      </div>
      <div className="tabs-contents">
        {this.classification['content'].map( (x,i) => <div className='tab-content' style={{display:(this.state.currentTabIndex === i)?'':'none'}}>{x}</div> ) }
      </div>
    </div>;
  }
}