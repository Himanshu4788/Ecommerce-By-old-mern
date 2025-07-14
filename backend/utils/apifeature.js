class ApiFeature {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    if (this.queryStr.keyword) {
      const keywordFilter = {
        name: {
          $regex: this.queryStr.keyword,
          $options: "i",
        },
      };
      this.query = this.query.find(keywordFilter);
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Fields to exclude from filtering
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Convert operators
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );
    let filterObj = JSON.parse(queryStr);

    // Convert number strings to actual numbers
    if (filterObj.price) {
      for (let op in filterObj.price) {
        filterObj.price[op] = Number(filterObj.price[op]);
      }
    }

    // Apply filter
    this.query = this.query.find(filterObj);

    return this;
  }


  pagination(resultPerPage){
    const currentPage = Number(this.queryStr.page) || 1;

    const skip =  resultPerPage * (currentPage - 1 )

    this.query = this.query.limit(resultPerPage).skip(skip)
    return this

  }
}

module.exports = ApiFeature;
