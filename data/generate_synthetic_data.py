import json
import random
from datetime import datetime, timedelta

# Rwandan districts
DISTRICTS = [
    'Kigali', 'Bugesera', 'Gatsibati', 'Gicumbi', 'Ngoma', 'Rwamagana',
    'Ngororero', 'Nyabihu', 'Nyarugenge', 'Nyaruguru', 'Nyungwe', 'Nyamagabe',
    'Karongi', 'Rutsiro', 'Rubavu', 'Gisagara', 'Huye', 'Nyamagabe'
]

TVET_TRADES = [
    'Software Development',
    'Electrical Installation',
    'Construction',
    'Hospitality',
    'Motor Vehicle',
    'Welding',
    'Plumbing',
    'Hairdressing'
]

REB_COMBINATIONS = [
    {'name': 'MPC', 'subjects': ['Mathematics', 'Physics', 'Chemistry']},
    {'name': 'PCB', 'subjects': ['Physics', 'Chemistry', 'Biology']},
    {'name': 'MEG', 'subjects': ['Mathematics', 'English', 'Geography']},
]

PROGRAMS = [
    {
        'code': 'CS101',
        'name': 'Bachelor of Science in Computer Science',
        'college': 'College of Science and Technology',
        'capacity': 50,
        'acceptsReb': True,
        'acceptsTvet': True,
        'minMathSkill': 60,
        'minTechnicalSkill': 55,
        'minScienceSkill': 50,
        'minCommunication': 50,
        'minProblemSolving': 55,
        'mathWeight': 0.3,
        'technicalWeight': 0.35,
        'scienceWeight': 0.15,
        'communicationWeight': 0.1,
        'problemSolvingWeight': 0.1,
    },
    {
        'code': 'ENG101',
        'name': 'Bachelor of Science in Civil Engineering',
        'college': 'College of Engineering',
        'capacity': 40,
        'acceptsReb': True,
        'acceptsTvet': True,
        'minMathSkill': 65,
        'minTechnicalSkill': 60,
        'minScienceSkill': 60,
        'minCommunication': 45,
        'minProblemSolving': 60,
        'mathWeight': 0.35,
        'technicalWeight': 0.3,
        'scienceWeight': 0.2,
        'communicationWeight': 0.05,
        'problemSolvingWeight': 0.1,
    },
    {
        'code': 'BUS101',
        'name': 'Bachelor of Business Administration',
        'college': 'College of Business',
        'capacity': 60,
        'acceptsReb': True,
        'acceptsTvet': False,
        'minMathSkill': 50,
        'minTechnicalSkill': 40,
        'minScienceSkill': 40,
        'minCommunication': 60,
        'minProblemSolving': 50,
        'mathWeight': 0.2,
        'technicalWeight': 0.1,
        'scienceWeight': 0.1,
        'communicationWeight': 0.4,
        'problemSolvingWeight': 0.2,
    },
    {
        'code': 'ENV101',
        'name': 'Bachelor of Science in Environmental Management',
        'college': 'College of Science and Technology',
        'capacity': 35,
        'acceptsReb': True,
        'acceptsTvet': True,
        'minMathSkill': 55,
        'minTechnicalSkill': 50,
        'minScienceSkill': 65,
        'minCommunication': 55,
        'minProblemSolving': 55,
        'mathWeight': 0.2,
        'technicalWeight': 0.15,
        'scienceWeight': 0.4,
        'communicationWeight': 0.15,
        'problemSolvingWeight': 0.1,
    },
]


def generate_reb_student():
    """Generate a synthetic REB student"""
    combo = random.choice(REB_COMBINATIONS)
    grades = ['A', 'B', 'C', 'D', 'E', 'F']
    grade_weights = [0.15, 0.25, 0.3, 0.2, 0.08, 0.02]  # Higher chance of C/B

    return {
        'pathway': 'REB',
        'rebResults': {
            'combination': combo['name'],
            'subjects': json.dumps({subj: grade for subj, grade in 
                                   zip(combo['subjects'], 
                                       random.choices(grades, weights=grade_weights, k=len(combo['subjects'])))}),
            'totalPoints': random.randint(20, 48),
            'gradeAverage': round(random.uniform(2.0, 4.0), 1),
            'yearCompleted': random.randint(2021, 2023),
            'schoolName': random.choice(['Lycée de Kigali', 'Lycée G. Apollinaire']),
        }
    }


def generate_tvet_student():
    """Generate a synthetic TVET student"""
    trade = random.choice(TVET_TRADES)
    competencies = {
        'Technical Skills': random.randint(50, 100),
        'Communication': random.randint(45, 95),
        'Problem Solving': random.randint(50, 100),
        'Mathematics': random.randint(40, 90),
        'Safety': random.randint(60, 100),
    }

    return {
        'pathway': 'TVET',
        'tvetResults': {
            'trade': trade,
            'specialization': random.choice(['Level 3', 'Level 4']),
            'level': random.choice([3, 4]),
            'competencies': json.dumps(competencies),
            'finalGrade': random.choice(['A', 'B', 'C', 'D']),
            'yearCompleted': random.randint(2021, 2023),
            'institution': random.choice(['IPRC East', 'IPRC West', 'IPRC Kigali']),
        }
    }


def generate_applicant():
    """Generate a synthetic applicant"""
    is_reb = random.choice([True, False])
    
    applicant = {
        'firstName': random.choice([
            'Amara', 'Benin', 'Chantal', 'David', 'Evelyne',
            'Fabrice', 'Gérard', 'Harriet', 'Ignacio', 'Jeanne',
            'Karim', 'Laurent', 'Marie', 'Nadia', 'Olivier'
        ]),
        'lastName': random.choice([
            'Ndabaga', 'Rumonge', 'Mukunzi', 'Ishimwe', 'Nyengane',
            'Kayitare', 'Rwaje', 'Mirundi', 'Sebahutu', 'Kaneza'
        ]),
        'email': f"applicant{random.randint(1000, 99999)}@test.rw",
        'password': "TempPassword123!",
        'gender': random.choice(['Male', 'Female']),
        'district': random.choice(DISTRICTS),
        'dateOfBirth': (datetime.now() - timedelta(days=random.randint(6570, 8760))).isoformat(),
    }

    if is_reb:
        applicant.update(generate_reb_student())
    else:
        applicant.update(generate_tvet_student())

    return applicant


def generate_dataset(count: int = 500):
    """Generate synthetic dataset"""
    applicants = [generate_applicant() for _ in range(count)]
    
    data = {
        'programs': PROGRAMS,
        'applicants': applicants,
        'generatedAt': datetime.now().isoformat(),
        'totalApplicants': len(applicants),
    }

    # Calculate statistics
    reb_count = sum(1 for a in applicants if a.get('pathway') == 'REB')
    tvet_count = sum(1 for a in applicants if a.get('pathway') == 'TVET')
    
    data['statistics'] = {
        'total': len(applicants),
        'rebApplicants': reb_count,
        'tvetApplicants': tvet_count,
        'genderDistribution': {
            'male': sum(1 for a in applicants if a.get('gender') == 'Male'),
            'female': sum(1 for a in applicants if a.get('gender') == 'Female'),
        },
        'districtDistribution': {
            district: sum(1 for a in applicants if a.get('district') == district)
            for district in DISTRICTS
        }
    }

    return data


if __name__ == '__main__':
    dataset = generate_dataset(500)
    
    # Save to file
    with open('synthetic_data.json', 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"✓ Generated {len(dataset['applicants'])} applicants")
    print(f"  REB: {dataset['statistics']['rebApplicants']}")
    print(f"  TVET: {dataset['statistics']['tvetApplicants']}")
    print(f"\n✓ Saved to synthetic_data.json")
