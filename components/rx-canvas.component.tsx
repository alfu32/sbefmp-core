
import React, { Component,createRef } from 'react';
import { EventPipeDirective,EventEmitter } from './event';
import { kebapCase, classifyItems, guid, id, TaggedChildrenClassifier, NodeRef } from './utils';
import { of,iif,forkJoin,fromEvent,Observable } from 'rxjs';
import { debounceTime,map,merge,mergeAll,concat,scan,take,distinct } from 'rxjs/operators';
import { Point,point,vector,matrix } from '@flatten-js/core';
import './rx-canvas.style.scss';

export class RXCanvas extends Component implements TaggedChildrenClassifier{
  canvasRef;
  divRef;
  divEvPipeRef;
  static eventMapper=ev => {
    return {
      type: ev.type,
      //target: ev,
      point: point(ev.clientX,ev.clientY),
      vector: vector(ev.clientX,ev.clientY),
      matrix: matrix(1,0,0,1,0,0)
    } }
  static kbEventMapper=ev => {
    let keys=[];
    if(ev.ctrlKey)keys.push("ctrl");
    if(ev.shiftKey)keys.push("shift");
    if(ev.altKey)keys.push("alt");
    keys.push(ev.key);

    return keys.join("-");
  }
    

  @EventEmitter( map(RXCanvas.eventMapper) ) pointerEvents;
  @EventEmitter( map(RXCanvas.kbEventMapper),distinct(),debounceTime(200) ) kbEvents;

  next=()=>{};

  events = new Observable( (subscriber) => {
    this.next = subscriber.next
  })

  _subscriptions=[];
  canvasRenderer;
  canvasModel;
  constructor( props ){
    super( props );
    this.canvasRef = React.createRef();
    this.divRef = React.createRef();
    this.divEvPipeRef = React.createRef();
    
  }
  componentDidMount(){
    this.init();
  }
  componentWillUnmount(){
    this._subscriptions.forEach( s => s.unsubscribe() );
    this._subscriptions = [];
    document.removeEventListener("keyup",this.kbEvents.notify.bind( this.kbEvents ))
    document.removeEventListener("keydown",this.kbEvents.notify.bind( this.kbEvents ))
  }
  init(){
    console.log(this.canvasRef);
    console.log(this.divRef);
    console.log(this.divEvPipeRef);
    console.log(this.props);
    document.addEventListener("keyup",this.kbEvents.notify.bind( this.kbEvents ));
    document.addEventListener("keydown",this.kbEvents.notify.bind( this.kbEvents ));
    //this.canvasRef.addEventListener("MouseDown",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("DragStart",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("DragOver",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("Drop",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("MouseMove",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("MouseUp",this.pointerEvents.notify.bind( this.pointerEvents ) );
    //this.canvasRef.addEventListener("Wheel",this.pointerEvents.notify.bind( this.pointerEvents ) );
    this._subscriptions.push(
      this.kbEvents.subscribe(this.props['on-inputEvent']),
      this.pointerEvents.subscribe(this.props['on-inputEvent']),
    );
    if( !this.props['renderer-factory'] ){
      throw new Error("rx-canvas has no renderer assigned, use <rx-canvas renderer-factory={rendererFactory}");
    }else{
      this.canvasRenderer=this.props['renderer-factory'](this.canvasRef.current.getContext('2d'));
    }
    if( !this.props['canvas-model'] ){
      throw new Error("rx-canvas has no model assigned, use <rx-canvas canvas-model={canvasModel}");
    }else{
      this.canvasModel=this.props['canvas-model'];
    }
  }
  classify(){
    return this.props.children.length?classifyItems(this.props.children,[EventPipeDirective]):{"default":[],"EventPipeDirective":[]}
  }
  render(){
    const items=this.classify();
    return <div ref={this.divRef}
        className="rx-canvas"
        { ... this.props}>
      <div ref={this.divEvPipeRef}>{items['EventPipeDirective']}</div>
      <canvas ref={this.canvasRef}
        droppable="true" 
        width={this.props['width']||768}
        height={this.props['height']||384}></canvas>
    </div>;
  }
}