import multer from 'multer'

const upload = multer(
    {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        //NOTE - allow PDF, Image, and TXT files for the new chat file flow
        fileFilter: (req, file, cb) => {
            const allowedMimetypes = ["application/pdf", "text/plain"];
            
            if (allowedMimetypes.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
                cb(null, true);
            } else {
                return cb(new Error("Only PDF, TXT, and Image files are allowed"));
            }
        }
    }
)
export default upload