import express from "express";
import { Request, Response } from "express";
import jimp = require("jimp");
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  app.get("/filteredimage", async (req: Request, res: Response) => {
    let imagePathUrl: string = await req.query.image_url; // extract the url for image from query parameter "image_url" and feed inside imagePathUrl variable

    // checks if url(imagePathUrl) is supplied or not
    if (!imagePathUrl) {
      return res
        .status(400)
        .send("Query Parameter is Incorrectly Passed in the URL");
    }

    // matches if the url(imagePathUrl) is in correct format or not
    if (!imagePathUrl.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/gm)) {
      return res.status(400).send("Incorrect URL Passed");
    }

    let mimetype: string = await getImageMime(imagePathUrl); // using the helper function to get the mimeType of image

    // checks the mime type of images using jimp module if mime type does not have image/* or starts with a message "" then it goes inside this if
    // suported mime types from jimp library are png, jpg, bmp, tiff and gif
    if (
      !mimetype.match(/^(image?)\/[^\s][a-z]*$/gm) ||
      mimetype.startsWith("failure, file not be supported by jimp module")
    ) {
      return res
        .status(400)
        .send(
          "File sent in query paramter is either not supported or doesn't exist on stated url"
        );
    }

    // create the filtered File and then remove local files after sending the filtered file in response
    let filteredFile = await filterImageFromURL(imagePathUrl);

    // returns the final output (filtered image)
    return res.status(200).sendFile(filteredFile, () => {
      deleteLocalFiles([filteredFile]);
    });
  });

  // Helper function which returns the mime type in case of supported files by jimp and a message for rejected files.
  async function getImageMime(url: string): Promise<string> {
    let fileBuf = await jimp
      .read(url)
      .then(async (fileBuffer) => {
        return await fileBuffer.getMIME();
      })
      .catch((failure) => {
        return "failure, file not be supported by jimp module";
      });
    return fileBuf;
  }
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    return res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
