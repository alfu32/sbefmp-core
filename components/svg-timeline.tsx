import React, { Component,Ref } from 'react';
import { kebapCase, classifyItems, guid, id, TaggedChildrenClassifier, NodeRef } from './utils';
import { EventEmitter } from './event';
import { last } from 'rxjs/operators';

export class Marble extends Component{
  @EventEmitter( ) timelineClick;
  eventStreamInput;
  time;
  value;
  constructor(props){
    super(props);
    this.time=props.time;
    this.value=props.value;
  }
  render(){
    return <g transform={ `translate(${this.props['pos-x']},15)` }>
      <circle r="15" style={{ fill:this.props['svg-color'] }}/>
      <text text-anchor="middle" y="5">{this.props.children}</text>
    </g>
  }
}

export class SvgTimeline extends Component{
  @EventEmitter( )
  timelineClick;
  eventStreamInput;
  
  state={
    buffer:[],
    interval:{minT:-1,maxT:1,deltaT:1} 
  }
  constructor(props){
    super(props);
  }
  bufferInputValue(v){
    const __timeframeLength = this.props['timeframe-length'];
    let __buffer=this.state.buffer;
    __buffer.push(v);
    const __maxT=__buffer[__buffer.length-1].time
    __buffer=__buffer.filter( v => v ? __maxT - v.time <= __timeframeLength : false );

    const __interval = {
      minT : __maxT - this.props['timeframe-length'],
      maxT : __maxT,
      deltaT : __maxT - __maxT - this.props['timeframe-length']
    };
    this.setState({...this.state,buffer:__buffer,interval:__interval});
  }
  componentDidMount(){
    this.eventStreamInput = this.props["event-stream"].subscribe( this.bufferInputValue.bind(this) );
  }
  componentWillUnmount(){
     this.eventStreamInput.unsubscribe();
  }

  render(){
    //console.log(this.state);
    const multiplier = 1/20;
    const bufferImage=this.state.buffer.map( it => {
      return {
        time: ( it.time - this.state.interval.minT ) * multiplier,
        value: it.value,
        color: it.color,
        type: it.type
      }
    });
    const polyline = bufferImage.map( it => {
      return [
        [-2,60],
        [-2,5],
        [2,5],
        [2,60]
      ].map( p => `${it.time + p[0]},${p[1]}` ).join(` `)
    }).join(` `);
    const color = bufferImage[0]?bufferImage[0].color:`black`;
    return <svg width="300" height="60" style={{width: "300px", height: "60px", overflow: "visible", display: 'block', marginLeft:'30px' }} viewBox="0 0 300 60">
      <line x1="0" y1="55" x2={this.props['timeframe-length']/20} y2="55" style={{stroke:'rgb(255,0,0)',strokeWidth:1}}></line>
      <polyline points={polyline} style={{fill: 'none', stroke: color, strokeWidth:1}} />
      { bufferImage.map( it => <Marble svg-color={it.color} pos-x={it.time}>{it.value}</Marble>) }
    </svg>
  }
}