const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let posts = [
  { id: 1, content: 'First post!', likes: 0, comments: [], shares: 0 },
];

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.send(JSON.stringify({ type: 'INITIAL_POSTS', payload: posts }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'LIKE_POST':
        posts = posts.map((post) =>
          post.id === data.payload.postId
            ? { ...post, likes: post.likes + 1 }
            : post
        );
        break;

      case 'ADD_COMMENT':
        posts = posts.map((post) =>
          post.id === data.payload.postId
            ? { ...post, comments: [...post.comments, data.payload.comment] }
            : post
        );
        break;

      case 'SHARE_POST':
        posts = posts.map((post) =>
          post.id === data.payload.postId
            ? { ...post, shares: post.shares + 1 }
            : post
        );
        break;

      default:
        break;
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'UPDATE_POSTS', payload: posts }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
