import _ from "lodash";
import Review from "./model";
import db from "../database";
import { simpleSortRows, allGeneric } from "../helpers";
import DataLoader from "dataloader";
import { cache } from "../config";

const getReviewByNr = nr => {
  let query = db
    .select()
    .from("review")
    .where("nr", nr);

  return query.then(rows => new Review(rows[0]));
};

const getReviewsByProductNr = productNr => {
  let query = db
    .select()
    .from("review")
    .where("product", productNr);

  return query.then(rows => rows.map(row => new Review(row)));
};

const getAllReviews = () => {
  let query = db.select().from("review");

  return query.then(rows => rows.map(row => new Review(row)));
};

export default class ReviewRepository {
  // ! DUMB
  async get(nr) {
    return getReviewByNr(nr);
  }

  // ! DUMB
  async all() {
    return getAllReviews();
  }

  // ! DUMB
  async sortBy({ productId: productNr, field, direction }) {
    let reviews = await getReviewsByProductNr(productNr);

    const sortByField = (field, direction) => {
      return function(a, b) {
        let comp = 0;
        if (a[field] > b[field]) {
          comp = 1;
        } else if (a[field] < b[field]) {
          comp = -1;
        }
        if (direction === "DESC") {
          return comp * -1;
        }
        return comp;
      };
    };

    if (field) reviews = reviews.sort(sortByField(field, direction));

    return reviews;
  }

  // ! DUMB
  async search({ field, criterion, pattern }) {
    let reviews = await this.all();

    switch (criterion) {
      case "CONTAINS":
        reviews = reviews.filter(review => review[field].includes(pattern));
        break;
      case "START_WITH":
        reviews = reviews.filter(review => review[field].startsWith(pattern));
        break;
      case "END_WITH":
        reviews = reviews.filter(review => review[field].endsWith(pattern));
        break;
      case "EQUALS":
        reviews = reviews.filter(review => review[field] === pattern);
        break;
    }

    return reviews;
  }
}
