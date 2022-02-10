import React from 'react';
import {
  combinePageStates,
  createPageState,
  PageStateSwitch,
  useEntry,
  usePageState
} from './PageState';
import UserLoadedPageState from './ps/UserLoadedPageState';

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

  return (
    <div>
      <PageStateSwitch pageState={pageState}>
        <div>something here</div>
        <UserNotLoaded>
          <div>user has not yet loaded</div>
        </UserNotLoaded>
        <UserLoading>
          <div>user is loading...</div>
        </UserLoading>
        <UserLoaded>
          {({ userId }: UserData) => <UserLoadedPageState userId={userId} />}
          <div>here?</div>
        </UserLoaded>
        <PostsNotLoaded>
          <div>posts have not yet loaded</div>
        </PostsNotLoaded>
        <PostsLoading>
          <div>posts are now loading...</div>
        </PostsLoading>
        <PostsLoaded>
          <div>posts are loaded!</div>
        </PostsLoaded>
      </PageStateSwitch>
    </div>
  );
}

export default App;
