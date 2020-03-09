var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("solver");
  var myobj = [
    { 
      name: 'Elementary Math', 
      topics: ['Arithmetic', 'Fractions', 'Percentages', 'Word Problem','Other'], 
      lessons: ['https://www.khanacademy.org/math/arithmetic', 'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic', 'khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-intro-percents/v/describing-the-meaning-of-percent'
      ,'https://www.khanacademy.org/math/arithmetic/arith-review-add-subtract#arith-review-add-sub-100-word-problems','https://www.khanacademy.org/search?referer=%2F&page_search_query=']
    },
    { 
      name: 'Algebra', 
      topics: ['Equation Solving','Polynomials','Simplification','Rational Functions','Matrices','Domain & Range','Other'],
      lessons: ['https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities','https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics-multiplying-factoring/x2f8bb11595b61c86:multiply-monomial-polynomial/v/polynomials-intro'
      ,'https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:rational/x2ec2f6f830c9fb89:cancel-common-factor/v/simplifying-rational-expressions-introduction','https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:rational',
      'https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:mat-intro/v/introduction-to-the-matrix','https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions#x2f8bb11595b61c86:introduction-to-the-domain-and-range-of-a-function'
      ,'https://www.khanacademy.org/search?search_again=1&page_search_query=']
    },
    { 
      name: 'Trigonometry', 
      topics: ['Trigonometric Functions','Trigonometric Identities','Spherical Trigonometry','Trigonometric Equations','Trigonometric Theorems','Other'],
      lessons: ['https://www.khanacademy.org/math/algebra-home/alg-trig-functions','https://www.khanacademy.org/math/trigonometry/trig-equations-and-identities'
      ,'https://www.youtube.com/watch?v=hcXbLRPq5vc','https://www.khanacademy.org/math/trigonometry/trig-equations-and-identities','https://www.khanacademy.org/math/trigonometry/trig-with-general-triangles',
      'https://www.khanacademy.org/search?search_again=1&page_search_query=']
    },
    { 
      name: 'Calculus',
      topics: ['Integrals','Derivatives','Limits','Sequences','Sums','Products','Series Expansions','Vector Analysis','Integral Transforms','Domain & Range', 'Continuity','Other'],
      lessons: ['https://www.khanacademy.org/math/integral-calculus/ic-integration','https://www.khanacademy.org/math/differential-calculus/dc-diff-intro',
      'https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new','https://www.khanacademy.org/math/ap-calculus-bc/bc-series-new','https://www.khanacademy.org/math/ap-calculus-bc/bc-series-new/bc-10-1/v/partial-sum-notation',
      'https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-8/v/applying-the-product-rule-for-derivatives','https://www.khanacademy.org/math/ap-calculus-bc/bc-series-new/bc-10-11/v/maclaurin-and-taylor-series-intuition','https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function/visualizing-vector-valued-functions/v/vector-fields-introduction',
      'https://www.khanacademy.org/math/differential-equations/laplace-transform','https://www.youtube.com/watch?v=f6NoHNJjmPc', 'https://www.khanacademy.org/math/in-in-grade-12-ncert/in-in-continuity-differentiability','https://www.khanacademy.org/search?search_again=1&page_search_query=']
    },
    {
      name: 'Physics',
      topics: ['Mechanics', 'Oscillations & Waves', 'Statistical Physics','Electricity & Magnetism','Thermodynamics','Optics','Relativity','Nuclear Physics','Quantum Physics','Astrophysics','Particle Physics','Physical Constants','Physical Principles','Fluid Mechanics'],
      lessons: ['https://www.khanacademy.org/science/physics/centripetal-force-and-gravitation', 'https://www.khanacademy.org/science/physics/mechanical-waves-and-sound', 'Statistical Physics','https://www.khanacademy.org/science/physics/light-waves','https://www.khanacademy.org/science/physics/thermodynamics','https://www.khanacademy.org/science/physics/geometric-optics',
      'https://www.khanacademy.org/science/physics/special-relativity','https://www.khanacademy.org/science/in-in-class-12th-physics-india/nuclei','https://www.khanacademy.org/science/physics/quantum-physics','https://www.khanacademy.org/science/physics/cosmology-and-astronomy','https://cosmologist.info/teaching/Cosmology/Physical_constants.pdf','https://www.khanacademy.org/science/physics','https://www.khanacademy.org/science/physics/fluids',
      'https://www.khanacademy.org/search?search_again=1&page_search_query=']
    },
    {
      name: 'Other',
      topics: ['Other'],
      lessons: ['https://www.khanacademy.org/search?search_again=1&page_search_query=']
    }

  ];
  dbo.collection("subjects").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});