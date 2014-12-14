// The first thing we need to use for the http request is the "http" package, which we install with "meteor add http". This package lets you make calls to other servers from within Meteor

if (Meteor.isClient) {
  Template.tweetList.helpers({
    tweets: function() {
      return Session.get("tweets");
    },
    latestRefresh: function() {
      return Session.get("latestRefresh") // So now the question is, how do we fill these session variables? We want to make an HTTP get request to the Twitter search API
    }                                       // We can't make this request from the client, because we are making a request that is from a different domain. So we're going to have to make the request on teh server, then send the results to the client. This is a perfect time to write a meteor method.
  });

  Meteor.setInterval(function() { // This will run every X number of seconds, defined at the end (currently 3000 milliseconds)
    Meteor.call("getTweets", "javascript", function(err, tweets) { // in this case, we are running the "getTweets" method, then passing in the search term "javascript", then a callback
      Session.set("tweets", tweets);
      var d = new Date();
      Session.set("latestRefresh", "" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()); // In this case, we are starting off with an empty string because d.getHours() returns a number, not a string, so we wouldn't be able to concatenate the strings with numbers if we didnt initialize it as a string.
    })
  }, 1000)

}

if (Meteor.isServer) {
  Meteor.methods({
    getTweets: function(searchTerm) {
      var response = Meteor.http.call("GET", "https://api.twitter.com/1.1/search/tweets.json"+searchTerm); // first it is the "GET" request, then the url, then an object with a bunch of options.
      // We could have also used Meteor.http.get
      // Or Meteor.http.post, Meteor.http.put, Meteor.http.del

      return response.data.results.map(function (tweet) {
        return {
          user: tweet.from_user_name,
          text: tweet.text
        }
      })   // Now all we have to do is call "getTweets" from teh client side, and it will make the request on teh server, then send the data to the client
    }
  })
}
