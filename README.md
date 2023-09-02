# Sucralose!
### A sweeter way to use e621!

## What is it?
Sucralose is a humble, modern front-end replacement for https://e621.net, using their API/back-end.

The goal is to provide a smoother, more user-friendly and mobile-friendly experience,
along with extra customization.

## Why?
I've always found e621 to have an outdated and lacking UI and UX.

Managing sets is a disaster, you have to visit posts to vote/favorite them, UI feels clunky, looks extremely outdated, etc.

This is not a bash on e621, many people prefer the dated look and feel. Personally, I prefer something more modern.

And also, I just enjoy making things, and e621 provides a pretty good and easy-to-understand API.

## Key features

- Clean UI, smooth UX -- A modernized UI that ensures a smooth and user-friendly experience.
- Subscriptions -- You can subscribe to artists/tags, with the ability to view all posts from your subscribed tags via the "subscriptions" page. If you install the PWA on your mobile device, you will also receive notifications when a post is made tagged with a subscribed tag.
- Multiple blacklist and quick switching -- The quick blacklists feature allows you to create an infinite number of different blacklists that you can quickly switch between via a dropdown menu on the posts page. The changes update instantly, no need to refresh the page or re-search.
- Easy pool viewing -- Posts that are part of a pool have a # icon, where you can quickly view all posts in the pool.
- Easy set management -- You can add and remove posts from your sets just by right clicking the post! All of your sets will show up underneath a sub-menu. Much easier than the original way to manage sets!
- Favorite sets -- You can favorite sets to quickly view them at a later date.
- Saved searches (coming soon) -- Saved searches allow you to save a specific search and quickly switch between your favorite searches.
- Search history (coming soon, optional) -- Search history allows you to recall previous search terms, and easily save them to your saved searches. This feature is optional, for those who have privacy concerns. If the feature is disabled, no search history will be saved to the database.
- Active development -- Sucralose is being actively developed, features and bug fixes will be available throughout development. You may request features either here, or any of my socials. https://kinzoku.one/contact

## Screenshots
![](https://i.imgur.com/L87tQcM.png)
![](https://i.imgur.com/t1EQLOL.png)
![](https://i.imgur.com/dmfuskc.png)
![](https://i.imgur.com/IYnSiCB.png)
![](https://i.imgur.com/F4ckdFj.png)
![](https://i.imgur.com/ZJ3AmKT.png)
![](https://i.imgur.com/ErYaCNu.png)
![](https://i.imgur.com/Vv642Fg.jpg)
![](https://i.imgur.com/N9rOOu4.png)

## Where do I try it?
You can visit the site at https://sucralose.top/.

## Why is a login necessary?
The login allows you to store your e621 username and API key in a shared account between devices, along with the ability to add custom features like subscriptions, saved searches, and quick blacklist switching via my database.

If you don't want to login, it is possible to browse the site without your e621 account.

If enough people suggest it, I will add an option to log into e621 without logging into Sucralose, and just store it locally on your browser.

## Forking/contributing
If you wish to fork or download this repo, simply run `npm i` to install its dependencies,
and `npm start` to start the development environment.

You will need to create your own secret.js file with a Firebase project. As that data is not visible on GitHub.