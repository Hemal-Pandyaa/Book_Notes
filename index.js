// importing
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

// constants
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// routes
app.get("/", async (req,res) => {
    let sampleData = [
        {
          "id": 1,
          "user_id": 123,
          "title": "Atomic Habits",
          "author": "James Clear",
          "cover_image_url": "https://www.jamesstuber.com/content/images/img/atomichabits.jpg",
          "author_image_url": "https://example.com/james_clear.jpg",
          "isbn": null,
          "rating": 4.9,
          "description": "Atomic Habits by James Clear is an insightful exploration of how tiny habits can lead to extraordinary results over time. Clear, drawing on scientific research and real-life examples, breaks down the mechanics of habit formation. This comprehensive guide not only helps readers understand the science behind habits but also provides actionable strategies to implement positive changes in daily life. Whether you're looking to break bad habits or build new ones, Atomic Habits offers a roadmap to personal development and lasting success.",
          "reviews": [
            {"comment_id": 1, "commentor_id": 456, "rating": 5, "comment": "A must-read for anyone looking to build positive habits. Clear and actionable advice that's easy to implement."},
            {"comment_id": 2, "commentor_id": 789, "rating": 4.5, "comment": "I found the book insightful and enjoyed the engaging writing style. Practical strategies for personal growth."},
            {"comment_id": 3, "commentor_id": 234, "rating": 2, "comment": "Atomic Habits didn't live up to the hype for me. I struggled to connect with the author's examples and found the advice less practical."},
            {"comment_id": 4, "commentor_id": 567, "rating": 4.8, "comment": "Well-researched and easy to follow. Clear's roadmap for personal growth is both practical and inspiring."},
            {"comment_id": 5, "commentor_id": 890, "rating": 3, "comment": "This book didn't resonate with me as much as I expected. The concepts felt repetitive, and I didn't find the strategies groundbreaking."},
            {"comment_id": 6, "commentor_id": 123, "rating": 4.2, "comment": "A solid guide to building habits and making positive changes. Clear's examples and stories make the concepts relatable."},
            {"comment_id": 7, "commentor_id": 456, "rating": 4.6, "comment": "I appreciated the practical advice and real-world examples. The book helped me understand the psychology behind habit formation."},
            {"comment_id": 8, "commentor_id": 789, "rating": 1, "comment": "Unfortunately, Atomic Habits didn't resonate with me. I found the writing style dry, and the concepts felt too simplistic."},
            {"comment_id": 9, "commentor_id": 234, "rating": 4.7, "comment": "An inspiring book that motivates readers to take small steps towards positive change. The strategies are applicable to various aspects of life."},
            {"comment_id": 10, "commentor_id": 567, "rating": 2, "comment": "I struggled to connect with the author's approach in Atomic Habits. The examples felt forced, and the advice didn't resonate with my personal experiences."}
          ],
          "publisher": "Hemal Pandya",
          "total_reviews": 250
        },
        {
          "id": 2,
          "user_id": 456,
          "title": "48 Laws of Power",
          "author": "Robert Greene",
          "cover_image_url": "https://m.media-amazon.com/images/I/61J3Uu4jOLL._AC_UF1000,1000_QL80_.jpg",
          "author_image_url": "https://example.com/robert_greene.jpg",
          "isbn": null,
          "rating": 4.7,
          "description": "Robert Greene's 48 Laws of Power is a classic examination of power dynamics throughout history. Greene presents these laws with insightful anecdotes and examples, offering readers a deep understanding of human behavior and influence. Whether you're a leader seeking to gain power or an individual aiming to protect yourself from manipulation, this book provides timeless lessons on navigating the complexities of power in various aspects of life.",
          "reviews": [
            {"comment_id": 11, "commentor_id": 789, "rating": 4.8, "comment": "Greene's 48 Laws of Power is a thought-provoking guide to understanding and wielding power effectively."},
            {"comment_id": 12, "commentor_id": 234, "rating": 4.5, "comment": "An intriguing exploration of power dynamics throughout history. The laws are presented with clarity and relevance."},
            {"comment_id": 13, "commentor_id": 567, "rating": 3, "comment": "While the 48 Laws of Power has its merits, I found some of the examples to be extreme and not universally applicable."},
            {"comment_id": 14, "commentor_id": 890, "rating": 4.6, "comment": "Greene's approach to dissecting power dynamics is both engaging and enlightening. A must-read for those in leadership roles."},
            {"comment_id": 15, "commentor_id": 123, "rating": 4.4, "comment": "A comprehensive guide to understanding power and influence. The laws are presented in a practical and applicable manner."},
            {"comment_id": 16, "commentor_id": 456, "rating": 4.7, "comment": "48 Laws of Power is not just a book; it's a strategic manual for those navigating complex social and professional landscapes."},
            {"comment_id": 17, "commentor_id": 789, "rating": 2, "comment": "I struggled with some of the ethical implications presented in the 48 Laws of Power. The examples felt manipulative rather than instructive."},
            {"comment_id": 18, "commentor_id": 234, "rating": 4.9, "comment": "A powerful guide to understanding and utilizing the principles of power. Greene's writing style keeps the reader engaged."},
            {"comment_id": 19, "commentor_id": 567, "rating": 4.5, "comment": "Despite a few reservations, I found the 48 Laws of Power to be a valuable resource for navigating professional relationships and power dynamics."}
          ],
          "publisher": "Samrth Kosadiya",
          "total_reviews": 200
        },
        {
          "id": 3,
          "user_id": 789,
          "title": "The Psychology of Money",
          "author": "Morgan Housel",
          "cover_image_url": "https://www.crossword.in/cdn/shop/products/9789390166268_1.jpg?v=1663936263",
          "author_image_url": "https://example.com/morgan_housel.jpg",
          "isbn": null,
          "rating": 4.5,
          "description": "In The Psychology of Money, Morgan Housel explores the complex relationship between money and human behavior. Through a series of engaging stories and practical insights, Housel delves into the psychological factors that influence our financial decisions. Whether discussing the role of luck, the importance of patience, or the impact of emotions on investing, this book provides a fascinating exploration of the mind's role in shaping our financial well-being.",
          "reviews": [
            {"comment_id": 20, "commentor_id": 234, "rating": 4.5, "comment": "A thought-provoking exploration of the psychological aspects of money. Housel's storytelling makes complex concepts accessible."},
            {"comment_id": 21, "commentor_id": 567, "rating": 4.2, "comment": "The Psychology of Money offers valuable insights into the behavioral aspects of financial decision-making. A recommended read."},
            {"comment_id": 22, "commentor_id": 890, "rating": 3.8, "comment": "While interesting, some chapters felt repetitive. Overall, a good read for those interested in the psychology behind financial choices."},
            {"comment_id": 23, "commentor_id": 123, "rating": 4.6, "comment": "Housel's book sheds light on the often-overlooked psychological factors that shape our financial journey. Insightful and accessible."},
            {"comment_id": 24, "commentor_id": 456, "rating": 4.7, "comment": "A well-researched and thought-provoking exploration of the human side of money. Housel's anecdotes make the content engaging."},
            {"comment_id": 25, "commentor_id": 789, "rating": 3.5, "comment": "I enjoyed the real-world examples, but some sections felt too focused on individual stories rather than broader financial principles."},
            {"comment_id": 26, "commentor_id": 234, "rating": 4.1, "comment": "The Psychology of Money provides a fresh perspective on financial decision-making. Housel's writing is both informative and accessible."},
            {"comment_id": 27, "commentor_id": 567, "rating": 4.9, "comment": "A compelling exploration of the intersection between psychology and finance. Housel's insights are applicable to individuals at all stages of their financial journey."},
            {"comment_id": 28, "commentor_id": 890, "rating": 4.4, "comment": "This book offers a unique angle on money, focusing on the psychological aspects that often go unnoticed. Highly recommended."},
            {"comment_id": 29, "commentor_id": 123, "rating": 3.9, "comment": "While informative, some sections felt overly detailed. However, Housel's ability to convey complex ideas in simple terms is commendable."}
          ],
          "publisher": "William Flakes",
          "total_reviews": 180
        },
        {
          "id": 4,
          "user_id": 234,
          "title": "Attitude Is Everything",
          "author": "Jeff Keller",
          "cover_image_url": "https://i0.wp.com/kitabee.pk/wp-content/uploads/2021/07/IMG_8430.jpeg?fit=334%2C500&ssl=1",
          "author_image_url": "https://example.com/jeff_keller.jpg",
          "isbn": null,
          "rating": 4.3,
          "description": "In Attitude Is Everything, Jeff Keller shares valuable insights on the power of a positive attitude in achieving success and fulfillment. Drawing on real-life examples and practical wisdom, Keller offers a guide to transforming one's mindset. This motivational book encourages readers to embrace positivity, overcome challenges, and take control of their lives. With actionable advice and inspiring anecdotes, Attitude Is Everything serves as a roadmap for personal and professional growth.",
          "reviews": [
            {"comment_id": 30, "commentor_id": 567, "rating": 4.3, "comment": "Attitude Is Everything is a motivational powerhouse. Keller's insights are practical and applicable to various aspects of life."},
            {"comment_id": 31, "commentor_id": 890, "rating": 4.5, "comment": "This book is a game-changer. Keller's emphasis on attitude as a determining factor in success is both inspiring and actionable."},
            {"comment_id": 32, "commentor_id": 123, "rating": 4.1, "comment": "Attitude Is Everything offers a refreshing perspective on the power of positivity. The actionable tips make it a worthwhile read."},
            {"comment_id": 33, "commentor_id": 456, "rating": 4.2, "comment": "Keller's book is a reminder of the impact attitude can have on our lives. Practical advice delivered with enthusiasm."},
            {"comment_id": 34, "commentor_id": 789, "rating": 3.8, "comment": "While the message is positive, some sections felt repetitive. Overall, a motivating read for those looking to enhance their mindset."},
            {"comment_id": 35, "commentor_id": 234, "rating": 4.4, "comment": "Attitude Is Everything is a compelling exploration of the role attitude plays in success. Keller's writing style is engaging and relatable."},
            {"comment_id": 36, "commentor_id": 567, "rating": 3.9, "comment": "I appreciated the anecdotes and practical tips in this book. It's a solid guide for anyone seeking to cultivate a positive mindset."},
            {"comment_id": 37, "commentor_id": 890, "rating": 4.6, "comment": "Keller's book came into my life at the right time. The principles shared are simple yet profound, making it a valuable read."},
            {"comment_id": 38, "commentor_id": 123, "rating": 4.0, "comment": "Attitude Is Everything provides practical advice for maintaining a positive mindset. Keller's passion for the subject is evident."},
            {"comment_id": 39, "commentor_id": 456, "rating": 4.7, "comment": "A motivational masterpiece. Keller's book is a source of inspiration for those looking to transform their lives through attitude."}
          ],
          "publisher": "Samrth Kosadiya",
          "total_reviews": 150
        },
        {
          "id": 5,
          "user_id": 567,
          "title": "Rich Dad Poor Dad",
          "author": "Robert T. Kiyosaki",
          "cover_image_url": "https://cdn.kobo.com/book-images/1200d87a-ec1d-4651-826d-52afb86d10f1/1200/1200/False/rich-dad-poor-dad-10.jpg",
          "author_image_url": "https://example.com/robert_kiyosaki.jpg",
          "isbn": null,
          "rating": 4.6,
          "description": "Rich Dad Poor Dad by Robert T. Kiyosaki challenges conventional beliefs about money and investing. Through the contrasting stories of his biological father (Poor Dad) and the father of his childhood friend (Rich Dad), Kiyosaki explores the principles of financial success. This personal finance classic encourages readers to think differently about wealth, assets, and liabilities, offering valuable lessons on building wealth and achieving financial independence.",
          "reviews": [
            {"comment_id": 40, "commentor_id": 890, "rating": 4.7, "comment": "A paradigm-shifting book on wealth and finance. Kiyosaki's insights are eye-opening and have the potential to reshape one's financial mindset."},
            {"comment_id": 41, "commentor_id": 123, "rating": 4.5, "comment": "Rich Dad Poor Dad challenges conventional financial wisdom in a compelling way. The principles shared are applicable and empowering."},
            {"comment_id": 42, "commentor_id": 456, "rating": 4.3, "comment": "This book opened my eyes to new perspectives on money and investing. Kiyosaki's approach is practical and thought-provoking."},
            {"comment_id": 43, "commentor_id": 789, "rating": 4.8, "comment": "A must-read for anyone seeking financial literacy. Kiyosaki's storytelling makes complex financial concepts accessible."},
            {"comment_id": 44, "commentor_id": 234, "rating": 4.6, "comment": "Rich Dad Poor Dad is a classic in personal finance literature. Kiyosaki's lessons are timeless and applicable to individuals at any stage of their financial journey."},
            {"comment_id": 45, "commentor_id": 567, "rating": 4.2, "comment": "While some concepts were familiar, Kiyosaki's unique perspective adds a layer of depth. A recommended read for those interested in financial independence."},
            {"comment_id": 46, "commentor_id": 890, "rating": 4.9, "comment": "Kiyosaki's book is a game-changer. It challenges traditional beliefs and provides a roadmap to financial success."},
            {"comment_id": 47, "commentor_id": 123, "rating": 4.4, "comment": "Rich Dad Poor Dad is not just about money; it's about mindset. Kiyosaki's principles are transformative and empowering."},
            {"comment_id": 48, "commentor_id": 456, "rating": 4.5, "comment": "I wish I had read this book earlier in life. Kiyosaki's insights on assets, liabilities, and wealth-building are invaluable."},
            {"comment_id": 49, "commentor_id": 789, "rating": 4.1, "comment": "A thought-provoking exploration of financial principles. Kiyosaki's storytelling makes the content engaging and relatable."}
          ],
          "publisher": "William Flakes",
          "total_reviews": 220

        },
        {
            "id": 6,
            "user_id": 890,
            "title": "Richest Man in Babylon",
            "author": "George S. Clason",
            "cover_image_url": "https://cdn.kobo.com/book-images/9b641bf6-ae44-4c1e-aa2b-e57ca746eb82/1200/1200/False/the-richest-man-in-babylon-31.jpg",
            "author_image_url": "https://example.com/george_clason.jpg",
            "isbn": null,
            "rating": 4.6,
            "description": "The Richest Man in Babylon by George S. Clason is a timeless classic that dispenses financial wisdom through a collection of parables set in ancient Babylon. This insightful book provides practical advice on wealth-building, money management, and achieving financial success. Clason's storytelling approach makes complex financial principles accessible to readers of all backgrounds. Whether you're just starting your financial journey or seeking to improve your money mindset, The Richest Man in Babylon offers valuable lessons that are as relevant today as they were when first published.",
            "reviews": [
              {"comment_id": 50, "commentor_id": 123, "rating": 5, "comment": "A must-read for anyone looking to build wealth and financial literacy. The lessons from ancient Babylon are surprisingly relevant."},
              {"comment_id": 51, "commentor_id": 456, "rating": 4.5, "comment": "The Richest Man in Babylon is a captivating read with timeless financial lessons. The parables make the concepts easy to grasp."},
              {"comment_id": 52, "commentor_id": 789, "rating": 4, "comment": "I enjoyed the practical advice woven into the ancient parables. The lessons on saving and investing are particularly valuable."},
              {"comment_id": 53, "commentor_id": 234, "rating": 4.8, "comment": "Clason's storytelling makes the principles of wealth-building memorable. A great book for anyone seeking financial wisdom."},
              {"comment_id": 54, "commentor_id": 890, "rating": 5, "comment": "The Richest Man in Babylon is a financial classic that stands the test of time. The principles are easy to apply to modern-day life."},
              {"comment_id": 55, "commentor_id": 123, "rating": 4.2, "comment": "I appreciated the blend of storytelling and financial advice. The parables are both entertaining and educational."},
              {"comment_id": 56, "commentor_id": 456, "rating": 4.6, "comment": "The timeless wisdom in this book is applicable to various financial situations. A valuable resource for anyone looking to build wealth."},
              {"comment_id": 57, "commentor_id": 789, "rating": 4.3, "comment": "The Richest Man in Babylon provides practical tips on managing money and building wealth. The ancient wisdom is surprisingly relevant."},
              {"comment_id": 58, "commentor_id": 234, "rating": 4.7, "comment": "Clason's financial advice is presented in an engaging and accessible way. The lessons from Babylon offer a fresh perspective on wealth-building."},
              {"comment_id": 59, "commentor_id": 567, "rating": 4.5, "comment": "A thought-provoking book that combines financial wisdom with ancient storytelling. The principles are straightforward and actionable."}
            ],
            "publisher": "William Flaskes",
            "total_reviews": 150
          },
    ]
      
    res.render("home.ejs", {books: sampleData});
})

// listening
app.listen(PORT, (req,res) => {
    console.log(`App is running on port ${PORT}`)
})