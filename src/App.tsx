import React from 'react';
import {
  combinePageStates,
  createPageState,
  PageStateSwitch,
  useEntry,
  usePageState
} from './PageState';
import UserLoadedFragment from './fragment/UserLoadedFragment';

const callUserApi = () =>
  new Promise<UserData>((resolve) =>
    setTimeout(() => resolve({ userId: 'abc' }), 1000)
  );

const callPostsApi = (userId: string) =>
  new Promise<PostsData>((resolve) =>
    setTimeout(() => resolve({ posts: [{ content: 'hello' }] }), 1000)
  );

const UserNotLoaded = createPageState('user-not-loaded');
const UserLoading = createPageState('user-loading');
const UserLoaded = createPageState<UserData>('user-loaded');
const PostsNotLoaded = createPageState('posts-not-loaded');
const PostsLoading = createPageState('posts-loading');
const PostsLoaded = createPageState<PostsData>('posts-loaded');

const InitialPageState = combinePageStates(UserNotLoaded, PostsNotLoaded);

function App() {
  const { pageState, makeTransition } = usePageState(InitialPageState);

  useEntry(
    UserNotLoaded,
    () => makeTransition(UserNotLoaded, UserLoading),
    pageState
  );

  useEntry(
    UserLoading,
    async () => {
      const r = await callUserApi();
      makeTransition(UserLoading, UserLoaded, r);
    },
    pageState
  );

  useEntry(
    UserLoaded,
    () => makeTransition(PostsNotLoaded, PostsLoading),
    pageState
  );

  useEntry(
    PostsLoading,
    async () => {
      const { userId } = pageState.getContext();
      const r = await callPostsApi(userId);
      makeTransition(PostsLoading, PostsLoaded, r);
    },
    pageState
  );

  return (
    <div>
      <PageStateSwitch pageState={pageState}>
        <div style={{ height: '30px', backgroundColor: '#e0e0e0' }}>
          Some irrelevant info here
        </div>

        <div style={{ height: '80px' }}>
          <UserNotLoaded>
            <div>User data is not yet loaded.</div>
          </UserNotLoaded>
          <UserLoading>
            <div>Loading user data...</div>
          </UserLoading>
          <UserLoaded>
            {({ userId }: UserData) => <UserLoadedFragment userId={userId} />}
            <div>User data is loaded!</div>
          </UserLoaded>
        </div>

        <div style={{ marginTop: '20px', backgroundColor: '#e0e0e0' }}>
          <PostsNotLoaded>
            <div>Posts are not yet loaded.</div>
          </PostsNotLoaded>
          <PostsLoading>
            <UserLoaded>
              {({ userId }: UserData) => {
                console.log('userId', userId);
                return <div>Loading {userId}'s posts...</div>;
              }}
            </UserLoaded>
          </PostsLoading>
          <PostsLoaded>
            <div>Posts are loaded!</div>
          </PostsLoaded>
        </div>
      </PageStateSwitch>
    </div>
  );
}

export default App;
