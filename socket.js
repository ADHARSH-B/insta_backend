let io;


module.exports = {
  init:(httpserver)=>{
        io =  require("socket.io")(httpserver)
        return io
  },
  getio:()=>{
      if(!io){
          console.log("An error in socket")
      }
      return io
  }
}