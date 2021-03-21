const { parseISO, format } = require('date-fns')
const differenceInHours = require('date-fns/differenceInHours')
const differenceInMinutes = require('date-fns/differenceInMinutes')
const dataSet = require('./dataSet.js')
const _ = require('lodash')
// console.log(differenceInHours(Date.now(),Date.now())
// console.log(dataSet.packet)
let primary = dataSet?.packet?.data
let initial = primary[0]
let differH = 1
let differM = 30
// console.log(initial,">>INITIAL")
// let createDateRef = []
// createDateRef.push({date: parseISO(initial.createdAt),count: 0})
let createDateRef = new Set()

function deepOmit(obj, keysToOmit) {
  let emailArr = []
  var keysToOmitIndex =  _.keyBy(Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit] ); // create an index object of the keys that should be omitted

  function omitFromObject(obj) { // the inner function which will be called recursivley
    return _.transform(obj, function(result, value, key) { // transform to a new object
      if (key in keysToOmitIndex) { // if the key is in the index skip it
        return;
      }
      result[key] = _.isObject(value) ? omitFromObject(value) : value; 
      if(result[key]?.email) emailArr.push(result[key].email)
      // if the key is an object run it through the inner function - omitFromObject
    })
  }
  
  return omitFromObject(obj); 
  // return the inner function result
}
let spaceData = {}
for(let i = 0; i < primary.length; i++){
    let differInHrs = differenceInHours(parseISO(primary[i].createdAt),parseISO(initial.createdAt))
    // let differInHrs = differenceInMinutes(parseISO(primary[i].createdAt),parseISO(initial.createdAt))
    // console.log(differInHrs)
    if(differInHrs < differH && i < primary.length-1){
        let deep = deepOmit(primary[i],['_id','name', 'updatedAt', 'createdAt'])
        // console.log("ITERATOR >>> ",i)
        for(const key in primary[i]){
            if(key.includes('space')){
                // console.log(deep)
                // console.log(spaceData, key)
                if(spaceData.hasOwnProperty(key)){
                    // console.log(">>TRUE")
                    // console.log(">>INITIAL",spaceData[key])
                    let emailList = _.map(primary[i][key], 'email')
                    let distinctEmail = new Set([...spaceData[key], ...emailList])
                    // console.log(emailList)
                    spaceData[key] = distinctEmail
                    // console.log(">>FINAL",spaceData)
                }
                else{
                    // console.log("FALSE")
                    // console.log(_.map(primary[i][key], 'email'))
                    spaceData[key] = _.map(primary[i][key], 'email')
                    // console.log(spaceData[key], key)
                }
            }
        }
    }
    else{
        createDateRef.add({date: format(parseISO(initial.createdAt), 'd-MMM-yyyy HH:mm:ss aa'),data: spaceData})
        initial = primary[i]
        spaceData = {}
        // console.log("BREAK >>",i," >>OUTPUT",createDateRef," >>")
        // break
    }
}
console.log(primary.length,createDateRef, ">>FINAL OUTPUT")