// Imports
var sha512 = require("sha512"); // Sha512 Library
// Modules
let citation = require("./citation");
// Exports
var exports = (module.exports = {});

exports.handleNewTweet = async function (body) {
  let parsedTweet = body.newParsedTweet;
  let newTweetKey = body.newTweetKey;
  let citation = null;
  let content = parsedTweet.content;
  let hashedTweet = await generateHash(parsedTweet);

  // Check Cache with Hash

  // return cached citation

  // Cite

  return citation;
};

let generateHash = async function (tweet) {
  let hash = {
    username: "",
    time: "",
    content: "",
  };
  hash.username = sha512(tweet.username).toString("hex");
  hash.time = sha512(tweet.time).toString("hex");
  hash.content = sha512(tweet.content).toString("hex");
  return hash;
};

// temp1 = {
//   "1254760868304183297":
//     'Balaji S. Srinivasan\n@balajis\n·\n40m\n"Avoid crowds" is the new "wash your hands".\n12\n18\n119',
//   "1254618912785915906":
//     "Elon Musk\n@elonmusk\n·\n10h\nSnowing in Texas\n0:06\n1.7M views\n1.2K\n3.4K\n52.1K",
//   "1254547555335041025":
//     "NASA\n@NASA\n·\n14h\nAirplanes fly about 600 mph, but the \n@Space_Station\n orbits Earth at 17,500 mph & looks like a very bright star moving across the sky. Did you know that you can track when the station will pass overhead? Find out when & where to #SpotTheStation: https://spotthestation.nasa.gov #NASAatHome\n0:57\n1.3M views\n226\n2.2K\n11K",
//   "1254612657178415104":
//     "Austen Allred\n@Austen\n·\n10h\nLambda School Slack and email migration now underway.\n\n3,000+ concurrent students, 150+ staff, thousands of alumni all migrating to Slack’s enterprise grid. \n\nNew workspaces, cleaner organization, and every student with a http://LambdaStudents.com email address.\nLambda School\nLaunch your new tech career from anywhere in just 9 months and pay nothing until you land a high-paying job. Attend live, online classes with one-on-one help whenever you need it. Full and part-time...\nlambdaschool.com\n3\n2\n57",
//   "1254613236038549505":
//     "Austen Allred\n@Austen\n·\n10h\nThe entire Lambda School team is focused on outcomes and improving the student experience right now.\n\nWe’re saying “no” to almost everything to make what we’re doing phenomenal.\n\nWe’ll see massive improvement in a short period of time.\n2\n2\n24",
//   "1254614431406804994":
//     "Austen Allred\n@Austen\n·\n10h\nI know there are many of you that Lambda School doesn’t work for yet. I get your (thousands of) emails, and I know you’re waiting. We want to get Lambda School to you.\n\nBut right now it’s the time to focus on us being operationally excellent in every way where we already are.\n5\n22",
// };
