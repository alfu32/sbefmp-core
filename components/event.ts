
import { id,guid } from './utils';
import { Observable,Subject } from 'rxjs';
import React , { Component,createRef } from 'react';
function waitPropsReady(instance,timeout=1000){
  return new Promise(function(resolve,reject){
    (function poll(){
      if(typeof(instance["props"])!=="undefined"){
        resolve(instance);
      }else{

        if(timeout-->0){
          setTimeout(poll,1);
        }else{
          reject({instance,error:"timed out"});
        }
      }
    })();
  })
}

export class EventPipeDirective extends Component{
  render(){
    return null;
  }
}

export function Pipe<T>( ... pipeargs: Observable<any>[]){
  return function(instance,_selector,descriptor){
    
    instance[_selector] = new MulticastEventObservable( ...pipeargs );
    //console.log( "pipe", pipeargs );
    console.log( "pipe on", instance.constructor.name, pipeargs.map( f => f ) );
    /*delegateFn(instance[_selector],_selector);*/
    //console.log( "EventEmitter",{instance,_selector} );
  }
}
export function EventEmitter<T>( ... pipeargs: Observable<any>[]){
  return function(instance,_selector,descriptor){

    instance[_selector] = new MulticastEventObservable( ...pipeargs );
    //console.log( "pipe", pipeargs );
    console.log( "pipe on", instance.constructor.name, pipeargs.map( f => f ) );
    /*delegateFn(instance[_selector],_selector);*/
    //console.log( "EventEmitter",{instance,_selector} );
  }
}
export const NodeRef = ()=>{
  return function(instance,_selector){
    instance[_selector] = createRef();
    console.log("NodeRef",instance,_selector,instance[_selector]);
    /*delegateFn(instance[_selector],_selector);*/
    //console.log( "EventEmitter",{instance,_selector} );
  }
}
console.log("NodeRef",NodeRef);
/*
export function SingleEventObservable(){
  var _observer,observable=new Observable((observer) => {
    _observer=observer;
    return {
      unsubscribe(){
        this.observers=this.observers.filter( o => o!==observer )
      }
    }
  });
  this.subscribe=(fn)=>{
    return observable.subscribe(fn);
  }
  this.notify=(event)=>{
    _observer.next(event);
  }
}
*/

export class SingleEventObservable<T> extends Observable<T>{
  private _observer;
  constructor( ... _pipe ){
    super((observer) => {
    this._observer=observer;
      return {
        unsubscribe(){
          this.observers=this.observers.filter( o => o!==observer )
        }
      }
    });
    this.pipe.apply( this, _pipe );
  }
  notify(event){
    this._observer.next(event);
  }
}
export class SingleEventObservable2{
  private _observable;
  private _observer;
  constructor( ... _pipe:Observable<any>[] ){
    this._observable = new Observable((observer) => {
      this._observer = observer;
      return {
        unsubscribe(){
          this.observers=this.observers.filter( o => o!==observer )
        }
      }
    }).pipe( ... _pipe );
  }
  subscribe(s){
    this._observable.subscribe(s);
  }
  notify(event){
    this._observer.next(event);
  }
}
export class MulticastEventObservable{
  private observers=[];
  private observer;
  private observable
  constructor( ... pipeargs:Observable<any>[] ){

    this.observable = new Observable((observer) => {
      if(this.observers.indexOf(observer) == -1 ){
        this.observers.push(observer);
      }
      return {
        id:guid(3,6),
        unsubscribe(){
          this.observers=this.observers.filter( o => o!==observer )
        }
      }
    }).pipe( ... pipeargs );
  }
  subscribe(fn){
    return this.observable.subscribe(fn)
  }
  notify(event){
    //Object.keys(this.observers).forEach( k => this.observers[k].next(event) );
    this.observers.forEach( o => o.next(event) );
  }
}