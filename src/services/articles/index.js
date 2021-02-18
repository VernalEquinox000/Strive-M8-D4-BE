const express = require("express")
const mongoose = require("mongoose")
const q2m = require("query-to-mongo")
const ArticleModel = require("./schema")
const ReviewModel = require("../reviews/schema")

const articlesRouter = express.Router()

//GET articles
/* articlesRouter.get("/", async (req, res, next) => {
  try {
    const articles = await ArticleModel.find()
    //also findOne or findById
    res.send(articles)
  } catch (error) {
    next(error)
  }
}) */
articlesRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query)
    console.log(query)
    const totArticles = await ArticleModel.countDocuments(query.criteria)

    const articles = await ArticleModel.find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)
      .populate("author", { _id: 0, name: 1, img: 1 })
    res.send({links: query.links("/articles",totArticles), articles})
  } catch (error) {
    console.log(error)
    next (error)
  }
})




//GET /articles/:id
articlesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const article = await ArticleModel.findById(id).populate("author")
    if (article) {
      res.send(article)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading articles list a problem occurred!")
  }
})

//POST /articles
articlesRouter.post("/", async (req, res, next) => {
  try {
        const newArticle = new ArticleModel(req.body)
        const { _id } = await newArticle.save()
        res.status(201).send(_id)
  } catch (error) {
        next(error)
  }
})

//PUT articles/:id
articlesRouter.put("/:id", async (req, res, next) => {
  try {
    const article = await ArticleModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,  //new Parameters
      new: true,
    })
    if (article) {
      res.send(article)
    } else {
      const error = new Error(`article with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

//DELETE articles/:id
articlesRouter.delete("/:id", async (req, res, next) => {
  try {
    const article = await ArticleModel.findByIdAndDelete(req.params.id)
    if (article) {
      res.send("Deleted")
    } else {
      const error = new Error(`article with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

 //GET /articles/:id/reviews => returns all the reviews for the specified article
articlesRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const article = await ArticleModel.findById(req.params.id, {
      reviews: 1,
      _id: 0,
    })
    res.send(article)
  } catch (error) {
    next(error)
  }
})

//GET /articles/:id/reviews/:reviewId => returns a single review for the specified article
articlesRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {

    /* const reviewToShow = await ArticleModel.findById(req.params.id, {
      reviewToShow: 1,
      _id: 0
    })
    console.log(reviewToShow)
    res.send(reviewToShow)  */

    const { reviews } = await ArticleModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id)
      },
      {
        _id:0,
        reviews: {
          $elemMatch: {_id: mongoose.Types.ObjectId(req.params.reviewId)},
        }
      }
    )

    if (reviews && reviews.length > 0) {
      res.send(reviews[0])
    } else {
      next()
    }
    
  } catch (error) {
    next(error)
  }
})

//POST /articles/:id => adds a new review for the specified article
articlesRouter.post("/:id/reviews", async (req, res, next) => {
  try { 
    /* const article = await ArticleModel.findByIdAndUpdate(
      id,
      {
        $push: { reviews: req.body },
      } */
    
    const reviewsArticle = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: {
            ...req.body,
          },
        },
      }
    );
    res.status(201).send(reviewsArticle);
  
  } catch (error) {
    next(error)
  }
})

articlesRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try { 
    const { reviews }  = await ArticleModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    )
    console.log(reviews)
    if (reviews && reviews.length > 0) {
      const reviewToReplace = { ...reviews[0].toObject(), ...req.body }
      console.log(reviewToReplace)
      mongoose.set('useFindAndModify', false);
      const modifiedReview = await ArticleModel.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        { $set: { "reviews.$": reviewToReplace } },
        {
          runValidators: true,
          new: true,
        } 
      )
      console.log(modifiedReview)
      res.send(modifiedReview)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})


articlesRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedReview = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      },
      {
        new: true,
      }
    )
    res.send(modifiedReview)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = articlesRouter