import user from './user';
import friendly from './friendly'
import message from './message'
import todo from './todo'
export default {
    ...user,
    ...friendly,
    ...message,
    ...todo
}
