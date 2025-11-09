import axios from 'axios';
import { ConfigService } from './ConfigService';
import { CacheService } from '../utils/CacheService';

interface CreateSiteResponse {
  structure: {
    name?: string;
    title?: string;
    description?: string;
    config?: any;
    layouts?: any[];
    includes?: any[];
    posts?: any[];
    pages?: any[];
    collections?: any;
    assets?: any;
  };
}

interface CreatePostResponse {
  content: string;
}

export class ApiService {
  static async createSite(prompt: string, idToken: string, options = {}): Promise<CreateSiteResponse> {
    // Create cache key based on prompt and options
    const requestData = { prompt, options: { useTailwind: prompt.toLowerCase().includes('tailwind'), ...options } };
    const cacheKey = CacheService.generateKey(`${ConfigService.API_BASE_URL}/ai`, requestData);
    
    // Try to get from cache first
    let response = await CacheService.get<CreateSiteResponse>(cacheKey);
    if (response) {
      return response;
    }

    // If not in cache, make the API call
    const apiResponse = await axios.post(`${ConfigService.API_BASE_URL}/ai`, requestData, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    // Cache the response for 24 hours
    await CacheService.set(cacheKey, apiResponse.data, 24 * 60 * 60 * 1000);
    
    return apiResponse.data as CreateSiteResponse;
  }

  static async createPost(title: string, idToken: string, tags: string[] = [], categories: string[] = []): Promise<CreatePostResponse> {
    // Create cache key based on request data
    const requestData = { title, tags, categories };
    const cacheKey = CacheService.generateKey(`${ConfigService.API_BASE_URL}/ai/generatePost`, requestData);
    
    // Try to get from cache first
    let response = await CacheService.get<CreatePostResponse>(cacheKey);
    if (response) {
      return response;
    }

    // If not in cache, make the API call
    const apiResponse = await axios.post(`${ConfigService.API_BASE_URL}/ai/generatePost`, requestData, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    // Cache the response for 1 hour
    await CacheService.set(cacheKey, apiResponse.data, 60 * 60 * 1000);
    
    return apiResponse.data as CreatePostResponse;
  }

  static async checkHealth() {
    // Health check should not be cached
    const response = await axios.get(`${ConfigService.API_BASE_URL}/health`);
    return response.data;
  }
}