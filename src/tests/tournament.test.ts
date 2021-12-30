import request from 'supertest';
import { Document } from 'mongoose';
import app from '../app';
import {
  setupUserDatabase,
  setupTournamentDatabase,
  groupEnabledTournamentForm,
  groupDisabledtournamentForm,
  setupTournamentListDatabase,
} from './fixtures/db';
import Tournament from '../models/tournament';
import { ObjectID } from 'mongodb';
import { RoundRobinType, StageType } from '../types/global';

// TODO: add locale files to store constants related to validation messages

let userOneToken: string;
let userTwoToken: string;
let initTournament: ITournamentDoc & Document<any, any, ITournamentDoc>;

beforeEach(async () => {
  const initUserDBResult = await setupUserDatabase();
  const initTournamentDBResult = await setupTournamentDatabase();
  userOneToken = initUserDBResult.userOneToken;
  userTwoToken = initUserDBResult.userTwoToken;
  initTournament = initTournamentDBResult.tournament;
});

const basicAPIURL = '/api/v1';
const adminAPIURL = `${basicAPIURL}/admin`;
const createTournamentURL = `${adminAPIURL}/tournaments`;
const updateTournamentURL = `${adminAPIURL}/tournaments/:id`;
const deleteTournamentURL = `${adminAPIURL}/tournaments/:id`;
const listTournamentURL = `${adminAPIURL}/tournaments`;
const detailTournamentURL = `${adminAPIURL}/tournaments/:id`;

describe(`create tournament - POST ${createTournamentURL}`, () => {
  describe('validation test', () => {
    test('should not create tournament for unauthorized user', async () => {
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Connection', 'keep-alive')
        .send(groupDisabledtournamentForm);

      expect(sut.status).toBe(401);
    });

    test('should not create tournament because of missing basic required fields', async () => {
      const {
        name,
        permalink,
        groupStageEnable,
        finalStageType,
        ...notRequiredFields
      } = groupDisabledtournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.name).toBe('Name is a required field');
      expect(sut.body.data.permalink).toBe('Permalink is a required field');
      expect(sut.body.data.groupStageEnable).toBe(
        'Tournament Type is a required field'
      );
      expect(sut.body.data.finalStageType).toBe(
        'Final Stage Type is a required field'
      );
    });

    test('should not create tournament because of missing required fields related to group stage when group stage enabled', async () => {
      const {
        groupStageGroupAdvancedSize,
        groupStageGroupSize,
        groupStageType,
        ...notRequiredFields
      } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
      };

      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageType).toBe(
        'Group Stage Type is a required field'
      );
      expect(sut.body.data.groupStageGroupSize).toBe(
        'Number of participants in each group is a required field'
      );
      expect(sut.body.data.groupStageGroupAdvancedSize).toBe(
        'Number of participants advanced from each group is a required field'
      );
    });

    test('should not create tournament because of Number of participants in each group and than Number of participants advanced from each group is not positive', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageGroupSize: 0,
        groupStageGroupAdvancedSize: 0,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupSize).toBe(
        'Number of participants in each group must be a positive number'
      );
      expect(sut.body.data.groupStageGroupAdvancedSize).toBe(
        'Number of participants advanced from each group must be a positive number'
      );
    });

    test('should not create tournament because of Number of participants in each group exceed limited of Round Robin group stage', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.RoundRobin,
        groupStageGroupSize: 21,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupSize).toBe(
        'Number of participants in each group must be less than or equal to 20'
      );
    });

    test('should not create tournament because of Number of participants in each group exceed limited of single elimination group stage', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.SingleElimination,
        groupStageGroupSize: 257,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupSize).toBe(
        'Number of participants in each group must be less than or equal to 256'
      );
    });

    test('should not create tournament because of Number of participants in each group exceed limited of double elimination group stage', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.DoubleElimination,
        groupStageGroupSize: 257,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupSize).toBe(
        'Number of participants in each group must be less than or equal to 256'
      );
    });

    test('should not create tournament because of `Number of participants advanced from each group` not power of 2 for single elimination group stage', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.SingleElimination,
        groupStageGroupAdvancedSize: 3,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupAdvancedSize).toBe(
        'Number of participants advanced from each group must be a power of 2 (1,2,4,8,16,...)'
      );
    });

    test('should not create tournament because of `Number of participants advanced from each group` not power of 2 for double elimination group stage', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.DoubleElimination,
        groupStageGroupAdvancedSize: 3,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupAdvancedSize).toBe(
        'Number of participants advanced from each group must be a power of 2 (1,2,4,8,16,...)'
      );
    });

    test('should not create tournament because of Number of participants in each group is less than Number of participants advanced from each group', async () => {
      const { ...notRequiredFields } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageGroupSize: 3,
        groupStageGroupAdvancedSize: 4,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageGroupAdvancedSize).toBe(
        'Number of participants advanced from each group must be less than Number of participants in each group'
      );
    });

    test('should not create tournament because of missing required final/group Stage Round Robin Type when final/group stage is round robin', async () => {
      const {
        groupStageRoundRobinType,
        finalStageRoundRobinType,
        ...notRequiredFields
      } = groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        groupStageType: StageType.RoundRobin,
        finalStageType: StageType.RoundRobin,
      };

      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.groupStageRoundRobinType).toBe(
        'Participants play each other is a required field'
      );
      expect(sut.body.data.finalStageRoundRobinType).toBe(
        'Participants play each other is a required field'
      );
    });

    test('should not create tournament because of missing required Include a match for 3rd place field when final stage is single elimination', async () => {
      const { finalStageSingleBronzeEnable, ...notRequiredFields } =
        groupEnabledTournamentForm;
      let missingRequiredFieldsTour = {
        ...notRequiredFields,
        finalStageType: StageType.SingleElimination,
      };

      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(missingRequiredFieldsTour);

      expect(sut.status).toBe(422);
      expect(sut.body.name).toBe('ValidationError');
      expect(sut.body.data.finalStageSingleBronzeEnable).toBe(
        'Include a match for 3rd place is a required field'
      );
    });
  });
  describe('create tournament', () => {
    test('should create disabled group stage with Single elimination final stage tournament', async () => {
      const name = 'World Cup 2024';
      const permalink = 'world-cup-2024';
      const tournamentForm = {
        ...groupDisabledtournamentForm,
        name,
        permalink,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(tournamentForm);

      expect(sut.status).toBe(201);

      // confirm that tournament has been inserted
      const tournament = await Tournament.findById(sut.body._id);
      expect(tournament).not.toBeNull();
      expect(tournament!.nameDisplay).toBe(name.trim());
      expect(tournament!.permalink).toBe(permalink.toLowerCase());
      expect(tournament!.groupStageEnable).toBe(false);
      expect(tournament!.groupStageType).toBeNull();
      expect(tournament!.groupStageGroupSize).toBeNull();
      expect(tournament!.groupStageGroupAdvancedSize).toBeNull();
      expect(tournament!.groupStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageType).toBe(StageType.SingleElimination);
      expect(tournament!.finalStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageSingleBronzeEnable).toBe(false);
    });

    test('should create disabled group stage with Single elimination final stage tournament', async () => {
      const name = 'World Cup 2024';
      const permalink = 'world-cup-2024';
      const finalStageSingleBronzeEnable = true;
      const tournamentForm = {
        ...groupDisabledtournamentForm,
        name,
        permalink,
        finalStageSingleBronzeEnable,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(tournamentForm);

      expect(sut.status).toBe(201);

      // confirm that tournament has been inserted
      const tournament = await Tournament.findById(sut.body._id);
      expect(tournament).not.toBeNull();
      expect(tournament!.nameDisplay).toBe(name.trim());
      expect(tournament!.permalink).toBe(permalink.toLowerCase());
      expect(tournament!.groupStageEnable).toBe(false);
      expect(tournament!.groupStageType).toBeNull();
      expect(tournament!.groupStageGroupSize).toBeNull();
      expect(tournament!.groupStageGroupAdvancedSize).toBeNull();
      expect(tournament!.groupStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageType).toBe(StageType.SingleElimination);
      expect(tournament!.finalStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageSingleBronzeEnable).toBe(
        finalStageSingleBronzeEnable
      );
    });

    Object.keys(RoundRobinType)
      .filter(k => !isNaN(Number(k))) // get only number typed keys from enum
      .forEach(rrType => {
        test(`should create disabled group stage with Round Robin [${rrType}] final stage tournament`, async () => {
          const name = 'World Cup 2024';
          const permalink = 'world-cup-2024';
          const finalStageType = StageType.RoundRobin;
          const finalStageRoundRobinType = Number(rrType);
          const tournamentForm = {
            ...groupDisabledtournamentForm,
            name,
            permalink,
            finalStageType,
            finalStageRoundRobinType,
          };
          const sut = await request(app)
            .post(createTournamentURL)
            // with attach(), test run inconsistently,
            // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
            .set('Authorization', `Bearer ${userOneToken}`)
            .set('Connection', 'keep-alive')
            .send(tournamentForm);

          expect(sut.status).toBe(201);

          // confirm that tournament has been inserted
          const tournament = await Tournament.findById(sut.body._id);
          expect(tournament).not.toBeNull();
          expect(tournament!.nameDisplay).toBe(name.trim());
          expect(tournament!.permalink).toBe(permalink.toLowerCase());
          expect(tournament!.groupStageEnable).toBe(false);
          expect(tournament!.groupStageType).toBeNull();
          expect(tournament!.groupStageGroupSize).toBeNull();
          expect(tournament!.groupStageGroupAdvancedSize).toBeNull();
          expect(tournament!.groupStageRoundRobinType).toBeNull();
          expect(tournament!.finalStageType).toBe(finalStageType);
          expect(tournament!.finalStageRoundRobinType).toBe(
            finalStageRoundRobinType
          );
          expect(tournament!.finalStageSingleBronzeEnable).toBeNull();
        });
      });

    test('should create disabled group stage with Double elimination final stage tournament', async () => {
      const name = 'World Cup 2024';
      const permalink = 'world-cup-2024';
      const finalStageType = StageType.DoubleElimination;
      const finalStageSingleBronzeEnable = true;
      const tournamentForm = {
        ...groupDisabledtournamentForm,
        name,
        permalink,
        finalStageType,
        finalStageSingleBronzeEnable,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(tournamentForm);

      expect(sut.status).toBe(201);

      // confirm that tournament has been inserted
      const tournament = await Tournament.findById(sut.body._id);
      expect(tournament).not.toBeNull();
      expect(tournament!.nameDisplay).toBe(name.trim());
      expect(tournament!.permalink).toBe(permalink.toLowerCase());
      expect(tournament!.groupStageEnable).toBe(false);
      expect(tournament!.groupStageType).toBeNull();
      expect(tournament!.groupStageGroupSize).toBeNull();
      expect(tournament!.groupStageGroupAdvancedSize).toBeNull();
      expect(tournament!.groupStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageType).toBe(finalStageType);
      expect(tournament!.finalStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageSingleBronzeEnable).toBeNull();
    });

    test('should create enable group stage tournament', async () => {
      const name = 'World Cup 2024';
      const permalink = 'world-cup-2024';
      const tournamentForm = {
        ...groupEnabledTournamentForm,
        name,
        permalink,
      };
      const sut = await request(app)
        .post(createTournamentURL)
        // with attach(), test run inconsistently,
        // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send(tournamentForm);

      expect(sut.status).toBe(201);

      // confirm that tournament has been inserted
      const tournament = await Tournament.findById(sut.body._id);
      expect(tournament).not.toBeNull();
      expect(tournament!.nameDisplay).toBe(name.trim());
      expect(tournament!.permalink).toBe(permalink.toLowerCase());
      expect(tournament!.groupStageEnable).toBe(true);
      expect(tournament!.groupStageType).toBe(StageType.RoundRobin);
      expect(tournament!.groupStageGroupSize).toBe(4);
      expect(tournament!.groupStageGroupAdvancedSize).toBe(2);
      expect(tournament!.groupStageRoundRobinType).toBe(1);
      expect(tournament!.finalStageType).toBe(StageType.SingleElimination);
      expect(tournament!.finalStageRoundRobinType).toBeNull();
      expect(tournament!.finalStageSingleBronzeEnable).toBe(false);
    });
  });
});

describe(`list tournament - GET ${listTournamentURL}`, () => {
  let tournamentList: ITournamentDoc[];
  let defaultPaginLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
  let defaultPaginPage = parseInt(process.env.PAGINATION_DEFAULT_PAGE!);
  beforeEach(async () => {
    const initTournamentListDBResult = await setupTournamentListDatabase();
    tournamentList = initTournamentListDBResult;
  });
  test(`Should list first page tournaments in default url`, async () => {
    const expectTournamentList = tournamentList
      .slice(tournamentList.length - defaultPaginLimit)
      .reverse();
    const response = await request(app)
      .get(listTournamentURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const resultTournaments = response.body.results as ITournamentDoc[];

    expect(resultTournaments.length).toBe(defaultPaginLimit);
    expect(resultTournaments).toEqual(
      JSON.parse(JSON.stringify(expectTournamentList))
    );
    expect(response.body.current).toBe(defaultPaginPage);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBe(2);
  });

  test(`Should list first page tournaments if no limit and page specified`, async () => {
    const expectTournamentList = tournamentList
      .slice(tournamentList.length - defaultPaginLimit)
      .reverse();
    const response = await request(app)
      .get(`${listTournamentURL}?limit=&page=`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const resultTournaments = response.body.results as ITournamentDoc[];

    expect(resultTournaments.length).toBe(defaultPaginLimit);
    expect(resultTournaments).toEqual(
      JSON.parse(JSON.stringify(expectTournamentList))
    );
    expect(response.body.current).toBe(defaultPaginPage);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBe(2);
  });

  test(`Should list tournaments with previous and next page`, async () => {
    const limit = 2,
      page = 3;
    const response = await request(app)
      .get(`${listTournamentURL}?limit=${limit}&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTournamentList = tournamentList
      .slice(tournamentList.length - 6, tournamentList.length - 4)
      .reverse();
    const resultTournaments = response.body.results as ITournamentDoc[];

    expect(resultTournaments.length).toBe(limit);
    expect(resultTournaments).toEqual(
      JSON.parse(JSON.stringify(expectTournamentList))
    );
    expect(response.body.current).toBe(page);
    expect(response.body.limit).toBe(limit);
    expect(response.body.lastPage).toBe(16);
    expect(response.body.previous).toBe(page - 1);
    expect(response.body.next).toBe(page + 1);
  });

  test(`Should list last page`, async () => {
    const page = 4;
    const response = await request(app)
      .get(`${listTournamentURL}?limit=&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTournamentList = tournamentList.slice(0, 2).reverse();
    const resultTournaments = response.body.results as ITournamentDoc[];
    expect(resultTournaments.length).toBe(2);
    expect(resultTournaments).toEqual(
      JSON.parse(JSON.stringify(expectTournamentList))
    );
    expect(response.body.current).toBe(page);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBe(page - 1);
    expect(response.body.next).toBeNull();
  });

  test(`Should list nothing because out of page range`, async () => {
    const page = 10;
    const response = await request(app)
      .get(`${listTournamentURL}?limit=&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTournamentList = [] as ITournamentDoc[];
    const resultTournaments = response.body.results as ITournamentDoc[];
    expect(resultTournaments.length).toBe(0);
    expect(resultTournaments).toEqual(
      JSON.parse(JSON.stringify(expectTournamentList))
    );
    expect(response.body.current).toBeNull();
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBeNull();
  });
});

describe(`detail tournament - GET ${detailTournamentURL}`, () => {
  let _idString: string;
  beforeEach(() => {
    const _id = initTournament._id as ObjectID;
    _idString = _id.toHexString();
  });

  test('should not create tournament for unauthorized user', async () => {
    const url = detailTournamentURL.replace(':id', _idString);
    const sut = await request(app)
      .get(url)
      .set('Connection', 'keep-alive')
      .send();

    expect(sut.status).toBe(401);
  });

  test(`Should display tournament detail`, async () => {
    const url = detailTournamentURL.replace(':id', _idString);
    const sut = await request(app)
      .get(url)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send();

    expect(sut.status).toBe(200);
    const resultTournaments = sut.body as ITournamentDoc;

    expect(resultTournaments).not.toBeNull();
    expect(resultTournaments!.name).toBe(initTournament.nameDisplay!.trim());
    expect(resultTournaments!.permalink).toBe(initTournament.permalink);
    expect(resultTournaments!.groupStageEnable).toBe(
      initTournament.groupStageEnable
    );
    expect(resultTournaments!.groupStageType).toBeNull();
    expect(resultTournaments!.groupStageGroupSize).toBeNull();
    expect(resultTournaments!.groupStageGroupAdvancedSize).toBeNull();
    expect(resultTournaments!.groupStageRoundRobinType).toBeNull();
    expect(resultTournaments!.finalStageType).toBe(
      initTournament.finalStageType
    );
    expect(resultTournaments!.finalStageRoundRobinType).toBeNull();
    expect(resultTournaments!.finalStageSingleBronzeEnable).toBe(false);
  });

  test(`Should not display not found tournament detail`, async () => {
    const url = detailTournamentURL.replace(':id', 'wrongid');
    const sut = await request(app)
      .get(url)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send();

    expect(sut.status).toBe(404);
  });

  describe(`delete tournament - DELETE ${deleteTournamentURL}`, () => {
    let _idString: string;
    beforeEach(() => {
      const _id = initTournament._id as ObjectID;
      _idString = _id.toHexString();
    });
    test(`Should delete tournament`, async () => {
      const url = deleteTournamentURL.replace(':id', _idString);
      const sut = await request(app)
        .delete(url)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send();
      expect(sut.status).toBe(200);
      expect(sut.body._id).toBe(_idString);
    });

    test(`Should response not found error if delete tournament that doesnt exist in db`, async () => {
      const _idString = 'wrongid'; // ObjectID from past
      const url = deleteTournamentURL.replace(':id', _idString);
      const sut = await request(app)
        .delete(url)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send();

      expect(sut.status).toBe(404);
    });

    test('Should not delete tournament for unauthorized user', async () => {
      const url = deleteTournamentURL.replace(':id', _idString);
      const sut = await request(app)
        .delete(url)
        .set('Connection', 'keep-alive')
        .send();

      expect(sut.status).toBe(401);
    });
  });
});
