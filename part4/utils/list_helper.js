const lodash = require('lodash')

const dummy = blogs => 1
const totalLikes = blogs => blogs.reduce((a, i) => a + i.likes, 0)
const favoriteBlog = blogs => blogs.reduce((a, i) => a.likes > i.likes ? a : i, {})

const mostBlogs = blogs => {
  const counter = lodash.countBy(blogs, 'author')
  return Object.entries(counter).reduce((a, i) => {
    return a.blogs > i[1] ? a : {"author":i[0], "blogs":i[1]}
  }, {})
}

const mostLikes = blogs => {
  const authorLikes = blogs.reduce((acc, blog) => {
    const key = blog.author
    if (!acc[key]) acc[key] = 0
    acc[key] += blog.likes
    return acc
  }, {})
  return Object.entries(authorLikes).reduce((a, i) => {
    return a.likes > i[1] ? a : {"author":i[0], "likes":i[1]}
  }, {})
}

module.exports = {dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes}