// import { graphQlQueryToJson } from "graphql-query-to-json";
// import { ServerError, ServerErrors } from "../classes";

// const assignValuesToObjectKeys = (requestedObj, actualObj) => {
//   for (const key of Object.keys(requestedObj)) {
// 	if (!actualObj.hasOwnProperty(key)) {
// 		throw `You requested a key that doesn't exist: ${key}`
// 	} else if (requestedObj[key] === true) {
//       requestedObj[key] = actualObj[key]
//     } else if (Array.isArray(actualObj[key])) {
//       // keep track of the object they requested
//       const originalRequest = requestedObj[key]
//       // then, create an array where that request used to be
//       // for us to "push" new elements onto
//       requestedObj[key] = []
//       for (const actualItem of actualObj[key]) {
//         // make a variable to store the result of assignValuesToObjectKeys
//         // we use { ...originalRequest } here to create a "copy"
//         const requestedItem = { ...originalRequest }
//         assignValuesToObjectKeys(requestedItem, actualItem)
//         requestedObj[key].push(requestedItem)
//       }
//     } else {
//       console.log(requestedObj[key])
//       // if the value isn't "true", we must have found a nested object
//       // so, we'll call this same function again, now starting from
//       // the nested object inside requestedObj
//       assignValuesToObjectKeys(requestedObj[key], actualObj[key])
//     }
//   }
// }

// export const queryObject = (actualObj : any = {} , query : string = '') => {
//   try {
//     const requestedObj = graphQlQueryToJson(query).query;
//     assignValuesToObjectKeys(requestedObj, actualObj)
//     return requestedObj;
//   } catch {
//     throw new ServerError(`Unvalid query : ${query} on object.`, ServerErrors.UNVALID_QUERY_OBJECT)
//   }
// }