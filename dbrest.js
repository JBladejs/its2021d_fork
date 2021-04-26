let common = require('./common')
let db = require('./db')

let collectionRest = module.exports = {
    
    getObjects: function(_id, collection, aggregation, nextTick) {
        if(_id) {
            aggregation.unshift({ $match: { _id: _id } })
        }
        collection.aggregate(aggregation, { collation: { "locale": common.config.collation, strength: 1 }}).toArray(nextTick)
    },

    handle: function(env, collection, aggregation = [], searchFields = [], inputTransformation = null, validateUpdate = null) {
        
        let _id = null
        if((env.req.method == 'GET' || env.req.method == 'DELETE') && env.parsedUrl.query._id) {
            try {
                _id = db.ObjectId(env.parsedUrl.query._id)
            } catch(ex) {
                common.serveError(env.res, 400, ex.message)
                return
            }
        }

        switch(env.req.method) {

            case 'GET':
                // pobierz pojedynczy obiekt z bazy/pobierz wszystkie

                // filtrowanie obiektów za pomocą env.parsedUrl.query.search
                if(env.parsedUrl.query.search && searchFields.length > 0) {
                    let searchFilter = { $or: [] }
                    for(let i in searchFields) {
                        let cond = {}
                        cond[searchFields[i]] = { $regex: env.parsedUrl.query.search, $options: 'i' }
                        searchFilter.$or.push(cond)
                    }
                    aggregation.unshift({ $match: searchFilter })
                }

                collectionRest.getObjects(_id, collection, aggregation, function(err, docs) {
                    if(err) {
                        common.serveError(env.res, 400, err.message)
                    } else {
                        if(_id) {
                            // pojedynczy obiekt
                            if(docs.length > 0) {
                                common.serveJson(env.res, 200, docs[0])
                            } else {
                                common.serveError(env.res, 404, 'Object not found')
                            }
                        } else {
                            // wszystkie
                            common.serveJson(env.res, 200, docs)
                        }
                    }
                })
                break

            case 'DELETE':
                // usuń pojedynczy obiekt w bazie/usuń wszystkie obiekty

                collection.deleteMany(_id ? { _id: _id } : {}, function(err, result) {
                    if(err) {
                        common.serveError(env.res, 400, err.message)
                    } else {
                        common.serveJson(env.res, 200, { deletedCount: result.deletedCount })
                    }
                })
                break

            case 'POST':
                // utwórz nowy obiekt w bazie
                
                if(inputTransformation) {
                    try {
                        inputTransformation(env.parsedPayload)
                    } catch(ex) { 
                        common.serveError(env.res, 400, ex.message)
                        return
                    }
                }
                if(!validateUpdate) validateUpdate = function(payload, nextTick) { nextTick(true) }
                validateUpdate(env.parsedPayload, function(ok) { 
                    if(!ok) {
                        common.serveError(env.res, 400, 'Validation failed, insertOne suppressed')
                        return
                    }
                    collection.insertOne(env.parsedPayload, function(err, result) {
                        if(err || !result.ops || !result.ops[0]) {
                            common.serveError(env.res, 400, err ? err.message : 'Error during insertOne')
                        } else {
                            collectionRest.getObjects(result.ops[0]._id, collection, aggregation, function(err, docs) {
                                if(err) {
                                    common.serveError(env.res, 400, err.message)
                                } else {
                                    if(docs.length > 0) {
                                        common.serveJson(env.res, 200, docs[0])
                                    } else {
                                        common.serveError(env.res, 404, 'Object not found')
                                    }
                                }
                            })
                        }
                    })
                })
                break

            case 'PUT':
                // zmodyfikuj element w bazie danych, którego _id jest równe payload._id

                try {
                    if(inputTransformation) {
                        inputTransformation(env.parsedPayload)
                    }
                    let _id = db.ObjectId(env.parsedPayload._id)
                    if(!validateUpdate) validateUpdate = function(payload, nextTick) { nextTick(true) }
                    validateUpdate(env.parsedPayload, function(ok) {
                        if(!ok) {
                            common.serveError(env.res, 400, 'Validation failed, findOneAndUpdate suppressed')
                            return
                        }
                        delete env.parsedPayload._id
                        collection.findOneAndUpdate({ _id: _id }, { $set: env.parsedPayload }, {}, function(err, result) {
                            if(err) {
                                common.serveError(env.res, 400, err.message)
                            } else {
                                collectionRest.getObjects(_id, collection, aggregation, function(err, docs) {
                                    if(err) {
                                        common.serveError(env.res, 400, err.message)
                                    } else {
                                        if(docs.length > 0) {
                                            common.serveJson(env.res, 200, docs[0])
                                        } else {
                                            common.serveError(env.res, 404, 'Object not found')
                                        }
                                    }
                                })
                            }
                        })
        
                    })
                } catch(ex) {
                    common.serveError(env.res, 400, ex.message)
                }
                break

            default:
                common.serveError(env.res, 405, 'Method not implemented')
        }
        return
    }

}