import {
    addOne,
    getByReviewId,
    getByMovieId,
    updateOne,
    deleteOne,
    hasReviewed,
    isAuthor
} from "../models/review_model.js";

// Luo uusi arvostelu
export async function createReview(req, res, next) {
    try {
        console.log(req.body);
        const {rating, comment, movieId, userId } = req.body;
       

        // tarkista että käyttäjä ei ole jo arvostellut tätä elokuvaa
        const alreadyReviewed = await hasReviewed(userId, movieId);
        if (alreadyReviewed) {
            return res.status(400).json({ error: "You have already reviewed this movie" });
        }
        const review = await addOne(userId, movieId, rating, comment);
        

        res.status(201).json({
            message: "Review created successfully",
            review: review
        });
    } catch (err) {
        next(err);
    }
}

// Hae arvostelut tietylle elokuvalle 
export async function getMovieReviews(req, res, next) {
    try {
        const { movieId } = req.params;
        const reviews = await getByMovieId(movieId);

        res.json(reviews);
    } catch (err) {
        next(err);
    }
}

// Päivitä arvostelu
export async function updateReview(req, res, next) {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.userId;

        // tarkista että arvostelu on olemassa
        const existingreview = await getByReviewId(reviewId);
        if (!existingreview) {
            return res.status(404).json({ error: "Review not found" });
        }

        // tarkista että käyttäjä on arvostelun tekijä
        const isAuthorReview = await isAuthor(reviewId, userId);
        if (!isAuthorReview) {
            return res.status(403).json({ error: "You are not the author of this review" });
        }

        const updatedReview = await updateOne(reviewId, rating, comment);

        res.json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (err) {
        next(err);
    }
}

// poista arvotelu 
export async function deleteReview(req, res, next) {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;

        // tarkista että arvostelu on olemassa
        const existingreview = await getByReviewId(reviewId);
        if (!existingreview) {
            return res.status(404).json({ error: "Review not found" });
        }

        // tarkista että käyttäjä on arvostelun tekijä
        const isAuthorReview = await isAuthor(reviewId, userId);
        if (!isAuthorReview) {
            return res.status(403).json({ error: "You are not the author of this review" });
        }
        await deleteOne(reviewId);

        res.json({ message: "Review deleted successfully" })
    } catch (err) {
    next(err);
}
}



