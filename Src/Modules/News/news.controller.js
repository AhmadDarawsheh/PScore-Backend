import newsModel from "../../../DB/news.model.js";

export const createNews = async (req, res) => {
  try {
    if (!req.type === "admin")
      return res.json({ message: "You are not able to add news" });
    const { title, description } = req.body;
    const image = req.fileUrl;

    const news = await newsModel.create({
      publisher:req.id,
      title,
      desc: description,
      image,
    });

    return res.json({ message: "You have created a piece of news", news });
  } catch (err) {
    console.log(err);
  }
};
