import React from 'react';

interface Props {
  userId: string;
}

const UserLoadedFragment = (props: Props) => {
  const userId = props.userId;

  return (
    <div>
      <h2>User: {userId}</h2>
    </div>
  );
};

export default UserLoadedFragment;
