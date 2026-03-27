const prisma = require('../../config/database');

const listCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

const createCategory = async (data) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-');
  return prisma.category.create({ data: { ...data, slug } });
};

const updateCategory = async (id, data) => {
  return prisma.category.update({ where: { id }, data });
};

const deleteCategory = async (id) => {
  return prisma.category.update({ where: { id }, data: { isActive: false } });
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
