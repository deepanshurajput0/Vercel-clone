const { exec } = require('child_process')
const path = require('path')
const mime = require('mime-types')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region:'',
  credentials:{
    accessKeyId:'',
    secretAccessKey:''
  }
})

const PROJECT_ID = process.env.PROJECT_ID

async function init(){
    console.log("executing script.js")
    const outDirPath = path.join(__dirname,'output')
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    p.stdout.on('data',function(data){
      console.log(data.toString())
    })
    
    p.stdout.on('error',function(data){
      console.log('Error',data.toString())
    })
    
    p.stdout.on('close',async function(){
     console.log('Build Complete')
     const distfolderPath = path.join(__dirname,'output','dist')
     const distfolderContents = fs.readdirSync(distfolderPath,{recursive:true})
     for(const filePath of distfolderContents){
       if(fs.lstatSync(filePath).isDirectory()) continue

       const command = new PutObjectCommand({
         Bucket: '',
         Key: `_outputs/${PROJECT_ID}/${filePath}`,
         Body: fs.createReadStream(filePath),
         ContentType:mime.lookup(filePath)
       })
       await s3Client.send(command)
     }
    })


}
init()


