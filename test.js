let t1 = [ "Ala", "Ola" ]
console.log(t1[1])

let t2 = [ { id: 1, name: "Ala" }, { id: 2, name: "Ola" } ]
let o = t2.find(function(el) { return el.id == 2 })
console.log(o.name)

let t3 = { "1": { name: "Ala" }, "2": { name: "Ola "} }
console.log(t3["2"].name)