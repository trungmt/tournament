import { Request, Response } from 'express';
import Team from '../../models/team';
import { resizeImage } from '../../middlewares/upload';
import { ITeam } from '../../models/team';

export const createTeam = async (
  req: Request<{}, {}, ITeam>,
  res: Response
) => {
  const teamFormData = req.body;
  const team = new Team(teamFormData);
  const flagIcon = req.file;

  //TODO: function to prepare env const
  const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);
  const flagIconHeight = parseInt(process.env.DEFAULT_IMAGE_HEIGHT!);
  try {
    if (flagIcon && flagIcon.buffer && flagIcon.buffer.length) {
      team.flagIcon = await resizeImage(
        flagIcon.buffer,
        flagIconWidth,
        flagIconHeight
      );
    }
    await team.save();
    res.status(201).send(team);
  } catch (error) {
    console.log('error', error);

    res.status(400).send(error);
  }
};
export const updateTeam = (req: Request, res: Response) => {};
export const deleteTeam = (req: Request, res: Response) => {};
export const getTeamList = (req: Request, res: Response) => {};
export const getTeamDetail = (req: Request, res: Response) => {};
