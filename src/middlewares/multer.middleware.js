import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, './public/temp')
  },
  filename: function (req, file, cd) {
    cd(null, file.originalname) //can be overritten
  },
})

export const upload = multer({ storage })
