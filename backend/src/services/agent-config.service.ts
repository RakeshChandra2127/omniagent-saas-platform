import { AppError } from '../utils/app-error';
import { AgentConfig } from '../models/agent-config.model';
import { paginate } from '../utils/helpers';

export class AgentConfigService {
  async create(tenantId: string, data: any) {
    const agent = await AgentConfig.create({ ...data, tenantId });
    return agent;
  }

  async findAll(tenantId: string, query: any = {}, page: number = 1, limit: number = 10) {
    const filter = { tenantId, status: { $ne: 'archived' }, ...query };
    const skip = (page - 1) * limit;
    const [agents, total] = await Promise.all([
      AgentConfig.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      AgentConfig.countDocuments(filter)
    ]);
    return { agents, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const agent = await AgentConfig.findOne({ _id: id, tenantId, status: { $ne: 'archived' } });
    if (!agent) {
      throw new AppError('Agent configuration not found', 404);
    }
    return agent;
  }

  async update(tenantId: string, id: string, data: any) {
    const agent = await AgentConfig.findOneAndUpdate(
      { _id: id, tenantId, status: { $ne: 'archived' } },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!agent) {
      throw new AppError('Agent configuration not found', 404);
    }
    return agent;
  }

  async delete(tenantId: string, id: string) {
    const agent = await AgentConfig.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status: 'archived' } },
      { new: true }
    );
    if (!agent) {
      throw new AppError('Agent configuration not found', 404);
    }
    return agent;
  }

  async updateKnowledgeBase(tenantId: string, id: string, entries: any[]) {
    const agent = await AgentConfig.findOneAndUpdate(
      { _id: id, tenantId, status: { $ne: 'archived' } },
      { $set: { knowledgeBase: entries } },
      { new: true }
    );
    if (!agent) {
      throw new AppError('Agent configuration not found', 404);
    }
    return agent;
  }
}

export const agentConfigService = new AgentConfigService();
