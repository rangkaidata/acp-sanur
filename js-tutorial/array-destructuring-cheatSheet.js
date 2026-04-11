

// basic array destructuring
const arr=[1,2,3];
const [a,b,c]=arr;

// skipping items and swapping values
var arr=[5,18,15,20];
var [a,,b]=arr;

console.log(a,b);// 5 15

[b,a]=[a,b];

console.log(a,b); // 15 5

// Default Values
const [a=0,b=0,c=0]=[5,3];
console.log(c); // 0

// Assigns default values (0) in case some array items are undefined or missing

// 4. Destructuring Return Values from a Function
function returnUser(tName,lName){
  return [fname,lName];
}

const [firstName,lastName]=returnUser("John","Doe");

console.log(firstName,lastName);// John Doe;

// Extracts values returned from a function directly into using array destructing.

// 5. Nested Desctructuring

const nestedArr=[5,6,3,[0,1]];
const [firstItem,,,[nest1,nest2]]=nestedArr;

console.log(firstItem,nest1,nest2); // 5 0 1

// Accesses nested array values by destructing deeper levels.


