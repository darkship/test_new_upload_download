Files = new FS.Collection("Files", {
    stores: [/*new FS.Store.FileSystem("images_fs", {
        //path: "~/app-files/images", //optional, default is "/cfs/files" path within app container
        //transformWrite: myTransformWriteFunction, //optional
        //transformRead: myTransformReadFunction, //optional
        //maxTries: 1 //optional, default 5
        //beforeWrite : mybeforeWritefunction //optional
    }),*/
        new FS.Store.GridFS("Files_grid", {
                //mongoUrl: 'mongodb://127.0.0.1:27017/test/', // optional, defaults to Meteor's local MongoDB
                //mongoOptions: {...},  // optional, see note below
                //transformWrite: myTransformWriteFunction, //optional
                //transformRead: myTransformReadFunction, //optional
                //maxTries: 1, // optional, default 5
                //chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes
                //beforeWrite : mybeforeWritefunction //optional
            }


        )]
});
CollectionTest=new Mongo.Collection("CollectionTest")

FS.HTTP.setBaseUrl("myBaseUrl")//set "myBaseUrl" instead of "cfs" (default) for fsFile.url()

if (Meteor.isClient) {
    Router.map(function()
    {
        this.route("file",{
            where:"server",
            path:"/myBaseUrl/*"
        })
        this.route("home",{
            path:"/",
            template:"imageUploader"
        })
    })
    Meteor.subscribe("Files")

    Template.imageUploader.images = function () {

        return Files.find();
    };
    Template.imageUploader.test = function () {
        return CollectionTest.find()
    };

    Template.imageUploader.events({
        'change #files': function (event, temp) {
            console.log('files changed');
            FS.Utility.eachFile(event, function (file) {
                var fileObj = new FS.File(file);
                fileObj.metadata = { owner_id: Meteor.userId() };
                Files.insert(fileObj,function (err, fileObj) {
                    if(err)
                        console.error(err)
                });
            });
        },
        'dropped #dropzone': function (event, temp) {
            console.log('files droped');
            FS.Utility.eachFile(event, function (file) {
                var fileObj = new FS.File(file);
                fileObj.metadata = { owner_id: Meteor.userId() };
                Files.insert(fileOb, function (err, fileObj) {
                    if(err)
                        console.error(err)
                });
            });
        },
        'click .btnRemove': function (event, temp) {
            this.remove();
        },
        'click .btnDownload':function(evt,plt)
        {
            Router.go(this.url({download:true,auth:100}))

        }
    });

    Tracker.autorun(function (){
        console.log( (Meteor.status().connected)?"connected":"disconnected")
    })
}

if (Meteor.isServer) {


    Meteor.startup(function(){
        if(!CollectionTest.find().count())
        {
            for(var i=0;i<10;i++)
                CollectionTest.insert({name:"test : "+i})
        }
    })
    Meteor.publish("Files", function () {
        return [Files.find({"metadata.owner_id": this.userId}),CollectionTest.find()]
    })

    Files.allow({
        insert: function (userId, fileObj) {
            return true//fileObj.metadata && userId==fileObj.metadata.owner_id;
        },
        update: function (userId, fileObj) {
            return true//false;
        },
        remove: function (userId, fileObj) {
            return true//fileObj.metadata && userId==fileObj.metadata.owner_id;
        },
// Allow eg. only the user in metadata
// the shareId is being discussed - eg. for sharing urls
        download: function (userId, fileObj/*, shareId*/) {
            return true//userId==fileObj.metadata.owner_id;
        },
        fetch: []//????
    });
}
