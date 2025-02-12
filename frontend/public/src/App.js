import React, { useEffect, useState } from 'react';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    setWs(websocket);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'INITIAL_POSTS':
        case 'UPDATE_POSTS':
          setPosts(data.payload);
          break;

        default:
          break;
      }
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleLike = (postId) => {
    ws.send(JSON.stringify({ type: 'LIKE_POST', payload: { postId } }));
  };

  const handleComment = (postId, comment) => {
    ws.send(
      JSON.stringify({ type: 'ADD_COMMENT', payload: { postId, comment } })
    );
  };

  const handleShare = (postId) => {
    ws.send(JSON.stringify({ type: 'SHARE_POST', payload: { postId } }));
  };

  const handlePost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        content: newPostContent,
        likes: 0,
        comments: [],
        shares: 0,
      };
      ws.send(JSON.stringify({ type: 'NEW_POST', payload: newPost }));
      setNewPostContent('');
    }
  };

  return (
    <div>
      <h1>Social Media Feed</h1>
      <div>
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Write a new post..."
        />
        <button onClick={handlePost}>Post</button>
      </div>
      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <p>{post.content}</p>
            <button onClick={() => handleLike(post.id)}>Like ({post.likes})</button>
            <button onClick={() => handleShare(post.id)}>Share ({post.shares})</button>
            <div>
              <input
                type="text"
                placeholder="Add a comment..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(post.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <ul>
                {post.comments.map((comment, index) => (
                  <li key={index}>{comment}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
