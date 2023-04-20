//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser : true});
mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://0.0.0.0:27017/todolistDB', { useNewUrlParser: true});



main().catch(err => console.log(err));



async function main() {

  mongoose.connect("mongodb+srv://admin-samhitha:SumaSuresh_123@cluster0.nveltys.mongodb.net/todolistDB");

  // this is coorect code.
  // await mongoose.connect('mongodb://0.0.0.0:27017/todolistDB', { useNewUrlParser: true});

  console.log("Connected");



}

const itemsSchema = {
  name  : String
};

//collection
const Item = mongoose.model("Item", itemsSchema) ;

const item1 = new Item({
  name: "Welcome to your to-do list"
});

const item2 = new Item({
  name: "Hit the + button to add new item"
});

const item3 = new Item({
  name : "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find().then(function (foundItems) {
    // console.log(foundItems);

    if(foundItems.length===0){
      Item.insertMany(defaultItems)
      .then(function(models){
       console.log("Successfully added items to db.")
      })
      .catch(function(err){
      console.log(err)
      });
      res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  })
  .catch(function (err) {
    console.log(err);
  });

  

});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name:itemName
    });  

    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listName})
      .then(function(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
      })
      .catch(function(err){

      });
    }

    
  
});

app.post("/delete", function(req,res){

  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemID)
  .then(function(models){
    console.log("Succesfully deleted the checked item");
    res.redirect("/");
  })
  .catch(function(err){
    console.log(err);
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}})
    .then(function(foundList){
        res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    })
  }

  
});


app.get("/:customListName", function (req, res){
  var customListName = _.capitalize(req.params.customListName);

 List.findOne({name:customListName})
 .then(function(foundList){
  if(!foundList){
    //create new list
    const list = new List({
      name : customListName,
      items : defaultItems
   });
  
   list.save(); 
   res.redirect("/"+customListName);
  }
  else{
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items} );
  }
 })
 .catch(function(err){
  console.log(err);
 }) ;
 
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
