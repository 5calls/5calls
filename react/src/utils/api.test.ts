import axios from 'axios';
import { postSearchTerm } from './api';
import { SEARCH_TERM_API_URL, LOCAL_STORAGE_KEYS } from '../common/constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('postSearchTerm', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALLER_ID, 'test-caller-id');
  });

  it('sends the platform and caller id with the query', async () => {
    mockedAxios.post.mockResolvedValue({ data: null });

    await postSearchTerm('medicaid');

    expect(mockedAxios.post).toHaveBeenCalledWith(SEARCH_TERM_API_URL, {
      query: 'medicaid',
      via: 'web',
      callerid: 'test-caller-id'
    });
  });

  it('swallows failures', async () => {
    mockedAxios.post.mockRejectedValue(new Error('offline'));
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});

    await expect(postSearchTerm('medicaid')).resolves.toBeUndefined();
    expect(debug).toHaveBeenCalled();
    debug.mockRestore();
  });
});
