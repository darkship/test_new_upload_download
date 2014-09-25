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

FS.HTTP.setBaseUrl("myBaseUrl")//set "myBaseUrl" instead of "cfs" (default) for fsFile.url()

if (Meteor.isClient) {
    Meteor.subscribe("Files")

    Template.imageUploader.images = function () {

        return Files.find();
    };
    Template.imageUploader.test = function () {
        return ["a","b","c","d"]
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
            window.location.href=this.url({download:true,auth:100})

        }
    });
}

if (Meteor.isServer) {


    Meteor.publish("Files", function () {
        return Files.find({"metadata.owner_id": this.userId})
    })

    Files.allow({
        insert: function (userId, fileObj) {
            return userId==fileObj.metadata.owner_id;
        },
        update: function (userId, fileObj) {
            return userId==fileObj.metadata.owner_id;
        },
        remove: function (userId, fileObj) {
            return userId==fileObj.metadata.owner_id;
        },
// Allow eg. only the user in metadata
// the shareId is being discussed - eg. for sharing urls
        download: function (userId, fileObj/*, shareId*/) {
            return userId==fileObj.metadata.owner_id;
        },
        fetch: []//????
    });
}