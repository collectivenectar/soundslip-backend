const Soundslip = require('../models/Soundslip')
const mongoose = require('mongoose')

module.exports = {
  // All users soundslips are returned, public and private
  getDashboard: async (request, response) => {
    try{
      const soundslips = await Soundslip.find({userId: request.body.id})
        .lean()
      response.status(200).send(soundslips)
    }catch (err){
      console.error(err)
      response.status(500).send({mssg: "no soundslips found for that user"})
    }
  },
  // All public soundslips in the db, pass in search params like instrument/genre/date/etc
  getPubSoundslips: async (request, response) => {
    // Add logic here for tags? It needs to fit max 2 different types of data as options:
    //  1) userName / Title
    //  2) tags - "drums" or "synth" or "other"
    try{
      let search = {
        $and:[
          {
            public: true
          },
        ]
      }
      if(request.query.filters.length > 0){
        if(filtersArray.length > 1){
          let filtersArray = []
          for(let eachFilter = 0; eachFilter < request.query.filters.length; eachFilter++){
            filtersArray.push({"tag": `${request.query.filters[eachFilter]}`})
          }
          search.$and.push({$or: filtersArray})
        }else{
          search.$and.push({"tag": request.query.filters[0]})
        }
      }
      if(request.query.queryType === "Username"){
        search.$and.push({userName: {'$regex': String(request.query.query), $options: "i"}})
      }else if(request.query.queryType === "Title"){
        let titleSearch = request.query.query
        if(titleSearch.split(" ").length > 1){
          for(let eachWord = 0; eachWord < titleSearch.split(" ").length; eachWord++){
            search.$and.push({"title": {'$regex': String(titleSearch[eachWord]), $options: "i"}})
          }
        }else{
          search.$and.push({"title": {'$regex': String(titleSearch), $options: "i"}})
        }
      }
      // request object has request.query which contains : 
      //    query:, queryType:, filters:
      // query is a string that gets split by (" "), queryType is either userName / title
      // filters is an array with string elements as tags
      // let search = {
      //   public: true
      // }
      // if(!request.query.queryType){
      // }else{
      //   if(request.query.queryType === "Username"){
      //     search["userName"] = request.query.query
      //   }else{
      //     if(request.query.query.includes(" ")){
      //       search["$and"] = []
      //       let split = request.query.query.split(" ")
      //       for(let word = 0; word < split.length; word++){
      //         // new RegExp(param1, $options:'i')
      //         search["$and"].push({"title": {'$regex': String(split[word]), $options: "i"}})
      //       }
      //     }else{
      //       search["title"] = {$regex: String(request.query.query), $options: "i"}
      //     }
      //   }
      // }
      // If the incoming request has filters? How should I rewrite multiple options gates?
      // if(request.query.filters)
      const soundslips = await Soundslip.find(search)
        // .populate('user')
//--->> This section needs tweaking for pagination
        .sort({createdAt: 'desc'})
        .lean()
      response.status(200).send(soundslips)
    }catch (err){
      console.error(err)
      response.status(500).json({mssg: "no soundslips found", error: err})
    }
  },
  // Find all public status soundslips for a specific user. i.e. profile page
  getPubSoundslipsByUser: async (request, response) => {
    try{
      const soundslips = await Soundslip.find({
        userName: request.params.username,
        public: true
      })
        .populate('username')
        .lean()
      response.status(200).send(soundslips)
    }catch(err){
      console.error(err)
      response.status(500).json({mssg: "error searching user pub sslips"})
    }
  },
  // CHANGING DB - confirming edit of the soundslip, on success db is changed.
  actionEditSoundslip: async (request, response) => {
    try{
      const soundslip = await Soundslip.findById({_id: request.body._id})
      if(!soundslip) {
        response.status(404).send({mssg: "not found"})
      }
      else if(soundslip.userId !== request.body.userId){
        response.status(404).send({mssg: "not yours to edit"})
      }
      else{
        await Soundslip.findOneAndUpdate({_id: soundslip._id}, {
          body: request.body.body,
          public: request.body.public,
          title: request.body.title
        }, {
          new: true,
          runValidators: true,
        })
        response.status(200).send({mssg: "edit successful"})
      }
    } catch(err){
      console.error(err)
      response.status(500).send({mssg: "error updating soundslip"})
    }
  },
}