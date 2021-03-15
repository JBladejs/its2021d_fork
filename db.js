var mongodb = require('mongodb')

const db = module.exports = {

    persons: null,

    init: function(dbUrl, dbName) {
        mongodb.MongoClient.connect(dbUrl, { useUnifiedTopology: true }, function(err, conn) {
            if(err) {
                throw new Error(err.message)
            }
            console.log('Connection to database', dbUrl, 'established')
            var adb = conn.db(dbName)
            persons = adb.collection('persons')
            persons.countDocuments(function(err, n) {
                if(err) {
                    throw new Error(err.message)
                }
                console.log('Number of persons', n)                    
            })
        })
    }

}