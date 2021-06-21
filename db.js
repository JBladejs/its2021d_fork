var mongodb = require('mongodb')

const db = module.exports = {

    persons: null,
    projects: null,
    tasks: null,

    ObjectId: mongodb.ObjectId,

    init: function(dbUrl, dbName, nextTick) {
        mongodb.MongoClient.connect(dbUrl, { useUnifiedTopology: true }, function(err, conn) {
            if(err) {
                throw new Error(err.message)
            }
            console.log('Połączenie z bazą', dbName, 'na', dbUrl, 'zestawione')
            var adb = conn.db(dbName)
            db.persons = adb.collection('persons')
            db.projects = adb.collection('projects')
            db.tasks = adb.collection('tasks')
            nextTick()
        })
    }

}