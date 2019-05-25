 
export function rangeIterator(_start,_end=0){
    const start=Math.min(_start,_end);
    const end=Math.max(_start,_end);
    const mem={index:start}
    return function *(){
      if(mem.index<end)yield (mem.index++);
    }
}
export function range(_start,_end=0){
    const start=Math.min(_start,_end);
    const end=Math.max(_start,_end);
    return new Array(end-start+1).fill(null).map( (v,i)=> start+i )
}
export function kebapCase(_string){
    const string = _string[0].toUpperCase() + _string.slice(1);
    const caps = string.match(/[A-Z]/g);
    const wordFragments = string.split(/[A-Z]/g).slice(1);
    return range(caps.length-1).map( i => caps[i].toLowerCase() + wordFragments[i] ).join("-")
}

export function classifyItems(array,classes){
    return array.reduce( (a,c) => {
        if(classes.indexOf(c.type) > -1){
            (a[c.type.name] = a[c.type.name]||[]).push(c)
        }else{
            a.default.push(c);
        }
        return a;
    },{default:[]})
}

export function guid(groups, groupLength){
  const MAX = Math.pow(36,groupLength);
  return range(groups).map( g => Number.parseInt( Math.random()*MAX + "" ).toString(36)).join('-');
}

let _id=1;
export function id(){
  return _id++;
}

export interface TaggedChildrenClassifier{
  classify();
}

Number.prototype.sign=function(){
  return Math.abs(this)/(this||1);
}
export function detectVisibleChildren(view){
  const parentRect=view.getBoundingClientRect();
  return Array.prototype.slice.call(view.children)
    .map( (n,i) => {
      const rect = n.getBoundingClientRect();
      return (
        ((rect.top-parentRect.top)<0 || (rect.bottom-parentRect.top)<0)
        || ((rect.top-parentRect.bottom)>0 || (rect.bottom-parentRect.bottom)>0)
      )?false:i
    })
    .filter( v => v );
}
