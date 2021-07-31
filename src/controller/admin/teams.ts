import { Request, Response } from 'express';
import Team from '../../model/team';

export const createTeam = async (req: Request, res: Response) => {
  const teamFormData = req.body;
  const team = new Team(teamFormData);
  try {
    await team.save();
    res.status(201).send(team);
  } catch (error) {
    res.status(400).send(error);
  }
};
export const updateTeam = (req: Request, res: Response) => {};
export const deleteTeam = (req: Request, res: Response) => {};
export const getTeamList = (req: Request, res: Response) => {};
export const getTeamDetail = (req: Request, res: Response) => {};
