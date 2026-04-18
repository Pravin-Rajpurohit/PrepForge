const QuestionCard = ({ question, index, total }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Question {index + 1} of {total}
        </span>
      </div>
      <h3 className="text-xl font-medium text-gray-900 leading-relaxed">
        {question}
      </h3>
    </div>
  );
};

export default QuestionCard;
