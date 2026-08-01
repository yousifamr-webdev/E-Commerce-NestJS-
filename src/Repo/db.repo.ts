import {
  Model,
  Types,
  type CreateOptions,
  type HydratedDocument,
  type MongooseBaseQueryOptions,
  type ProjectionType,
  type QueryFilter,
  type QueryOptions,
  type UpdateQuery,
} from "mongoose";
import { type UpdateOptions } from "mongodb";
import mongodb from "mongodb";


abstract class DBRepo<T> {
  constructor(private Model: Model<T>) {}

  async create({ data, options }: { data: any; options?: CreateOptions }) {
    return await this.Model.create(data, options);
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findOne(filter, projection, options);
  }

  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter?: QueryFilter<T>;
    update?: UpdateQuery<T>;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findOneAndUpdate(filter, update, options);
  }

  async find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.find(filter, projection, options);
  }

  async updateOne({
    filter = {},
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: UpdateOptions;
  }) {
    return await this.Model.updateOne(filter, { ...update, $inc: { __v: 1 } });
  }

  async findById({
    id,
    projection,
    options,
  }: {
    id: string | Types.ObjectId;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findById(id, projection, options);
  }

  getDBDoc(data: T) {
    return new this.Model(data);
  }

  async saveDBDoc(doc: HydratedDocument<T>) {
    return await doc.save();
  }

  async paginate({
    filter = {},
    projection,
    options = {},
    page = 1,
    limit = 20,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null;
    options?: QueryOptions<T>;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [docs, totalDocs] = await Promise.all([
      this.Model.find(filter, projection, options).skip(skip).limit(limit),
      this.Model.countDocuments(filter),
    ]);

    return {
      docs,
      pagination: {
        page,
        limit,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        hasNextPage: page * limit < totalDocs,
        hasPreviousPage: page > 1,
      },
    };
  }
  async deleteOne({
    filter,
    options,
  }: {
    filter: QueryFilter<T>;
    options?: (mongodb.DeleteOptions & MongooseBaseQueryOptions<T>) | null;
  }) {
    return await this.Model.deleteOne(filter, options);
  }
}

export default DBRepo;
