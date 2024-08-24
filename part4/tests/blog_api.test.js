const { test, afterAll, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");

const newUserToken = async () => {
  const newUser = {
    username: "automatedTestUser",
    name: "Automated Test User",
    password: "testuser",
  };

  await api.post("/api/users").send(newUser);
  const loginDetails = await api.post("/api/login").send(newUser);
  return loginDetails.body.token;
};

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("correct ammount of blog posts are returned in json format", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("property _id is defined", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("new blog post is created", async () => {
  const newBlog = {
    title: "Best ways to make money online",
    author: "overnight",
    url: "www.spam.com",
    likes: 9898,
  };

  const token = await newUserToken();

  await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsinDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const title = blogsAtEnd.map((n) => n.title);
  expect(title).toContain("Best ways to make money online");
});

test("adding blog fails if token not provided", async () => {
  const newBlog = {
    title: "Best ways to make money online",
    author: "overnight",
    url: "www.spam.com",
    likes: 9898,
  };
  await api.post("/api/blogs").send(newBlog).expect(401);
});

test("if the likes missing, default to value 0", async () => {
  const newBlog = {
    title: "wikipedia",
    author: "wikipedia",
    url: "www.wikipedia.com",
  };

  const token = await newUserToken();

  const response = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog);
  expect(response.body.likes).toBe(0);
});

test("fails with statuscode 404 if title & url are missing", async () => {
  const newBlog = {
    // title: "miniclip",
    author: "miniclip",
    // url: "www.miniclip.com",
    likes: 95815,
  };

  const token = await newUserToken();

  await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog)
    .expect(400);
  // expect(response.body.likes).toBe(0)
});

afterAll(() => {
  mongoose.connection.close();
});
