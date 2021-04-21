var common = require('./common')
var db = require('./db')

var collectionRest = module.exports = {
    
    getObjects: function(_id, collection, aggregation, nextTick) {
        if(_id) {
            aggregation.unshift({ $match: { _id: _id } })
        }
        collection.aggregate(aggregation, { collation: { "locale": common.config.collation, strength: 1 }}).toArray(nextTick)
    },

    handle: function(env, collection, aggregation = [], inputTransformation = null, validateUpdate = null) {
        switch(env.req.method) {

            case 'GET':
                var _id = null
                if(env.parsedUrl.query._id) {
                    // pobieranie pojedynczego obiektu w bazie
                    try {
                        _id = db.ObjectId(env.parsedUrl.query._id)
                    } catch(ex) {
                        common.serveError(env.res, 400, ex.message)
                        return
                    }
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
                var _id = null
                if(env.parsedUrl.query._id) {
                    // kasowanie pojedynczego obiektu w bazie
                    try {
                        var _id = db.ObjectId(env.parsedUrl.query._id)
                    } catch(ex) {
                        common.serveError(env.res, 400, ex.message)
                    }
                }
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
                    var _id = db.ObjectId(env.parsedPayload._id)
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